import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import * as admin from "firebase-admin"

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, "firebase") {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req) => req.headers.authorization?.split(' ')[1],
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  async validate(token: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token)
      return decodedToken
    }
    catch (error) {
      return null
    }
  }
}
