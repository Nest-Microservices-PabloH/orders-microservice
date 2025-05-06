import { OrderStatus } from "@prisma/client";
import { IsEnum, IsUUID } from "class-validator";


export class ChangeOrderStatusDto {
    @IsUUID()
    id: string;

    @IsEnum(OrderStatus, {
        message: `Valid status are ${Object.values(OrderStatus).join(', ')}`
    })
    status: OrderStatus
}

