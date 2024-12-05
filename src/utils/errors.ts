// src/utils/errors.ts

export class BadRequestError extends Error {
    statusCode: number;
    constructor(message: string) {
      super(message);
      this.name = 'BadRequestError';
      this.statusCode = 400;
    }
  }
  
  export class UnauthorizedError extends Error {
    statusCode: number;
    constructor(message: string) {
      super(message);
      this.name = 'UnauthorizedError';
      this.statusCode = 401;
    }
  }
  
  export class NotFoundError extends Error {
    statusCode: number;
    constructor(message: string) {
      super(message);
      this.name = 'NotFoundError';
      this.statusCode = 404;
    }
  }
  
  export class DatabaseError extends Error {
    statusCode: number;
    constructor(message: string) {
      super(message);
      this.name = 'DatabaseError';
      this.statusCode = 500;
    }
  }
  
  export class ServerError extends Error {
    statusCode: number;
    constructor(message: string) {
      super(message);
      this.name = 'ServerError';
      this.statusCode = 500;
    }
  }
  