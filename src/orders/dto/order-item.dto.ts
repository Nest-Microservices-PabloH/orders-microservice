import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class OrderItemDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    productId: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    quantity: number

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    price: number;
}

