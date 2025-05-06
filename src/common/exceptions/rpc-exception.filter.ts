import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

interface RpcErrorResponse {
    statusCode: number;
    message: string;
    [key: string]: any;
}

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
    private isRpcErrorResponse(error: any): error is RpcErrorResponse {
        return (
            typeof error === 'object' &&
            error !== null &&
            'statusCode' in error &&
            'message' in error
        );
    }

    private getStatusCode(statusCode: any): number {
        const parsedCode = Number(statusCode);
        return isNaN(parsedCode) ? 400 : parsedCode;
    }

    catch(exception: RpcException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const rpcError = exception.getError();

        if (this.isRpcErrorResponse(rpcError)) {
            const statusCode = this.getStatusCode(rpcError.statusCode);
            return response.status(statusCode).json(rpcError);
        }

        response.status(400).json({
            statusCode: 400,
            message: rpcError
        });
    }
}

