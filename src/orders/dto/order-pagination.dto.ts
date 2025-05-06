import { OrderStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dtos/pagination.dto";



export class OrderPaginationDto extends PaginationDto {


    @IsOptional()
    @IsEnum(OrderStatus, {
        message: `El estado debe ser uno de los siguientes valores: ${Object.values(OrderStatus).join(', ')}`
    })
    status: OrderStatus

}

