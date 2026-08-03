import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/redirect",
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    console.log("======= Google Profile =======");
    console.log(JSON.stringify(profile, null, 2));
    console.log("===============================");

    const email = profile?.emails?.[0]?.value;
    const firstName = profile?.name?.givenName ?? null;
    const lastName = profile?.name?.familyName ?? null;
    const profile_image = profile?.photos?.[0]?.value ?? null;

    if (!email) {
      return done(new Error("Email not provided by Google"), undefined);
    }

    const user = {
      email,
      firstName,
      lastName,
      profile_image,
      accessToken,
    };

    done(null, user);
  }
}