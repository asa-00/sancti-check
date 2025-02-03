import { Request, Response, Router } from "express";
import * as authController from "../controllers/authController";
//import passport from "passport";
import { authenticateToken, refreshToken, generateAccessToken, generateRefreshToken } from "../services/tokenService";
import { IUser } from "../interfaces/IUser";
import logger from "../utils/logger";
import { authorizeRole } from "../middleware/authorizeRole";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);

/**
 * @route POST /token
 * @description Refreshes the access token using the refresh token
 * @access Public
 */
router.post("/token", async (req: Request, res: Response) => {
  try {
    await refreshToken(req, res);
  } catch (error) {
    logger.error('Error refreshing token:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /auth
 * @description Initiates OAuth2 authentication
 * @access Public
 */
//router.get('/auth', passport.authenticate('oauth2'));

/**
 * @route GET /auth/callback
 * @description Handles OAuth2 callback and generates access and refresh tokens
 * @access Public
 */
/* router.get(
  "/auth/callback",
  passport.authenticate("oauth2", { session: false }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as IUser;
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
      res.redirect("/");
    } catch (error) {
      logger.error('Error during OAuth2 callback:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
); */

export default router;
