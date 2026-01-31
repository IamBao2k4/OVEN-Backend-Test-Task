export class BaseResponse<T> {
  data?: T;
  message?: string;
  statusCode: number;
  timestamp: string;

  constructor(data?: T, message?: string, statusCode: number = 200) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;

  constructor(error: string, statusCode: number = 500) {
    this.error = error;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}
