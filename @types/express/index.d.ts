// @types/express/index.d.ts
import { JwtPayload } from 'jsonwebtoken';  // if using JWT

declare module 'express-serve-static-core' {
  interface Request {
    user?: string | JwtPayload;  // or adjust type as needed
  }
}
