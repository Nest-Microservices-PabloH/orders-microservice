import { OrderStatus } from "@prisma/client";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from "class-validator";

export class CreateOrderDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    totalAmount: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    totalItems: number;

    @IsEnum(OrderStatus, {
        message: `Status must be one of the following: ${Object.values(OrderStatus).join(', ')}`
    })
    @IsOptional()
    status: OrderStatus = OrderStatus.PENDING;

    @IsBoolean()
    @IsOptional()
    paid: boolean = false;
}
