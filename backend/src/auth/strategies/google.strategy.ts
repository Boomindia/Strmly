import { Injectable, Logger } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, type VerifyCallback } from "passport-google-oauth20"
import { ConfigService } from "@nestjs/config"
import { AuthService } from "../auth.service"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private readonly logger = new Logger(GoogleStrategy.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const clientID = configService.get<string>("GOOGLE_CLIENT_ID")
    const clientSecret = configService.get<string>("GOOGLE_CLIENT_SECRET")
    const callbackURL = `${configService.get<string>("BACKEND_URL")}/api/auth/google/callback`

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ["email", "profile"],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    this.logger.log(`Google OAuth Profile: ${JSON.stringify(profile, null, 2)}`)

    const { name, emails, photos, _json } = profile

    // Extract comprehensive user data from Google profile
    const googleUserData = {
      email: emails[0].value,
      name: _json.name || `${name.givenName} ${name.familyName}`,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0]?.value || _json.picture,
      locale: _json.locale,
      verifiedEmail: _json.verified_email,
      googleId: profile.id,
      accessToken,
      // Additional profile information
      profileUrl: `https://plus.google.com/${profile.id}`,
    }

    const existingUser = await this.authService.validateUser(googleUserData.email)

    if (existingUser) {
      // Update existing user with latest Google data
      const updatedUser = await this.authService.updateUser(existingUser.id, {
        name: googleUserData.name,
        avatar: googleUserData.picture,
        email: googleUserData.email,
        // Update additional fields if they don't exist
        ...((!existingUser.bio || existingUser.bio === "Welcome to my profile! 👋") && {
          bio: `Hello! I'm ${googleUserData.firstName}. Welcome to my profile! 👋`,
        }),
      })
      return done(null, updatedUser)
    }

    // If user doesn't exist, create a new one with comprehensive Google data
    const newUser = await this.authService.createUser({
      email: googleUserData.email,
      name: googleUserData.name,
      picture: googleUserData.picture,
      provider: "google",
      providerAccountId: profile.id,
      firstName: googleUserData.firstName,
      lastName: googleUserData.lastName,
      locale: googleUserData.locale,
      verifiedEmail: googleUserData.verifiedEmail,
    })

    return done(null, newUser)
  }
}
