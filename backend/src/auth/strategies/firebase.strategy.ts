import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-jwt"
import * as admin from "firebase-admin"

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, "firebase") {
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
