import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrderPaginationDto, ChangeOrderStatusDto, PaidOrderDto } from './dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService
  ) { }

  @MessagePattern({ cmd: 'createOrder' })
  async create(@Payload() createOrderDto: CreateOrderDto) {

    const order = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order);

    return {
      order,
      paymentSession
    };
  }

  @MessagePattern({ cmd: 'findAllOrders' })
  findAll(
    @Payload() orderPaginationDto: OrderPaginationDto
  ) {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern({ cmd: 'findOneOrder' })
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern({ cmd: 'changeOrderStatus' })
  changeOrderStatus(
    @Payload() changeOrderStatusDto: ChangeOrderStatusDto
  ) {
    return this.ordersService.changeOrderStatus(changeOrderStatusDto);
  }

  @EventPattern({ cmd: 'payment.succeeded' })
  paidOrder(
    @Payload() paidOrderDto: PaidOrderDto
  ) {
    return this.ordersService.paidOrder(paidOrderDto);
  }

}
