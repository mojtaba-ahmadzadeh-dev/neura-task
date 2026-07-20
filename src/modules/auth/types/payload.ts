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
