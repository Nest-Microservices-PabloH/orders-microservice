import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from '../config/envs';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PRODUCTS_SERVICE } from 'src/config/services';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    ClientsModule.register([
      {
        name: PRODUCTS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.PRODUCTS_MICROSERVICES_HOST,
          port: envs.PRODUCTS_MICROSERVICES_PORT,
        },
      },
    ]),
  ]
})
export class OrdersModule { }
