import { Request } from "express"
import { User } from "../../users/schemas/user.schema"

export interface RequestWithUser extends Request {
  user: User
} 