export default class BaseResponse {
    success: boolean;
    message: string;
    status: number;
    data: any;

    constructor(success: boolean, message: string, status: number, data: any){
        this.success = success;
        this.message = message;
        this.status = status;
        this.data = data;
    }

    static success(data: any, message: string = 'OK'){
        return new BaseResponse(true, message, 200, data);
    }

    static error(message: string, status: number = 500){
        return new BaseResponse(false, message, status, null);
    }
}