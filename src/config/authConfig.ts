import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/User';
import { IUser } from '../interfaces/IUser'; 
import logger from '../utils/logger';

interface IOAuthProfile {
    id: string;
    displayName: string;
}

const oauthOptions = {
    authorizationURL: 'https://provider.com/oauth2/authorize',
    tokenURL: 'https://provider.com/oauth2/token',
    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    callbackURL: 'https://yourapp.com/auth/callback'
};

passport.use(new OAuth2Strategy(oauthOptions, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await UserModel.findOne({ oauthId: profile.id });
        if (!user) {
            user = new UserModel({ oauthId: profile.id, name: profile.displayName });
            await user.save();
        }
        return done(null, user);
    } catch (error) {
        logger.error('Error during OAuth2 authentication:', error.message);
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, (user as any).id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch (error) {
        logger.error('Error during user deserialization:', error.message);
        done(error);
    }
});

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('oauth2', { session: false }, (err: any, user: IUser, info: any) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    })(req, res, next);
};