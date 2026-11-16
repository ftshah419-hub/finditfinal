/**
 * Standardized API response format for all successful operations.
 */
export class ApiResponse {
  constructor(statusCode = 200, data = {}, message = 'Operation successful') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data
    });
  }

  static ok(res, data = {}, message = 'Operation successful') {
    return new ApiResponse(200, data, message).send(res);
  }

  static created(res, data = {}, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message).send(res);
  }
}

export default ApiResponse;
