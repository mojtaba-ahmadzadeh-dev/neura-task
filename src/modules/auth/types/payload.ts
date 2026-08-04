import { Request } from 'express';

export type CookiePayload = {
  userId: number;
};

export interface AccessTokenPayload {
  userId: number;
  roleId: number;
}

export type EmailTokenPayload = {
  email: string;
};

export type PhoneTokenPayload = {
  phone: string;
};

export type GoogleUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  accessToken?: string;
  profile_image?: string;
};

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}
