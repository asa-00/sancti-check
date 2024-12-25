export type CustomHttpStatusCode = {
  OK: number;
  CREATED: number;
  ACCEPTED: number;
  BAD_REQUEST: number;
  UNAUTHORIZED: number;
  FORBIDDEN: number;
  NOT_FOUND: number;
  SERVER_TIMEOUT: number;
  CONFLICT: number;
  SERVER_CLOSED: number;
  CLIENT_CLOSED: number;
  INTERNAL_SERVER: number;
};

export const httpStatusCode: CustomHttpStatusCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_TIMEOUT: 408,
  CONFLICT: 409,
  SERVER_CLOSED: 451,
  CLIENT_CLOSED: 499,
  INTERNAL_SERVER: 500,
};
