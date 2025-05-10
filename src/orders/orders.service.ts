import { Injectable, Logger, OnModuleInit, HttpStatus, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { NATS_SERVICE } from '../config';

import { CreateOrderDto, ChangeOrderStatusDto, OrderPaginationDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      // Validate products
      const productsIds = createOrderDto.items.map(item => item.productId);
      const products: any[] = await firstValueFrom(
        this.client.send({ cmd: 'validateProducts' }, productsIds)
      );

      // Calculate total amount and total items
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const product = products.find(
          product => product.id === orderItem.productId
        );

        if (!product) {
          throw new RpcException({
            status: HttpStatus.BAD_REQUEST,
            message: `Product with id ${orderItem.productId} not found`
          });
        }

        return acc + (product.price * orderItem.quantity);
      }, 0);

      const totalItems = createOrderDto.items.reduce((acc, item) => acc + item.quantity, 0);

      // Create order
      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map(orderItem => ({
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                price: products.find(product => product.id === orderItem.productId).price
              }))
            }
          }
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            }
          }
        }
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map(orderItem => ({
          ...orderItem,
          name: products.find(product => product.id === orderItem.productId).name
        }))
      };

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Error al validar los productos: ${error.message}`
      });
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { page, limit, status } = orderPaginationDto;
    const where = status ? { status } : {};

    const [data, totalPages] = await Promise.all([
      this.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit
      }),
      this.order.count({ where })
    ]);

    return {
      data,
      meta: {
        totalPages,
        page,
        lastPage: Math.ceil(totalPages / limit)
      }
    }
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id },
      include: {
        OrderItem: {
          select: {
            productId: true,
            quantity: true,
            price: true,
          }
        }
      }
    });
    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`
      });
    }

    const productsIds = order.OrderItem.map(item => item.productId);
    const products: any[] = await firstValueFrom(
      this.client.send({ cmd: 'validateProducts' }, productsIds));

    if (products.length !== order.OrderItem.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Products with ids ${productsIds.join(', ')} not found`
      });
    }

    return {
      ...order,
      OrderItem: order.OrderItem.map(orderItem => ({
        ...orderItem,
        name: products.find(product => product.id === orderItem.productId).name
      }))
    };
  }

  async changeOrderStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;

    const order = await this.findOne(id);

    if (order.status === status) return order;

    return this.order.update({
      where: { id },
      data: { status }
    });
  }
}
