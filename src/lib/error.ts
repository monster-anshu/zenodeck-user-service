export class HttpException extends Error {
  statusCode: number;
  message: string;
  data: unknown | undefined;

  constructor(message: string, statusCode: number, data: unknown = undefined) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }
}
