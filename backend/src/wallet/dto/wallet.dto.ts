import { IsString, IsNumber, IsObject, Min } from "class-validator"

export class WithdrawDto {
  @IsNumber()
  @Min(10)
  amount: number

  @IsString()
  method: string

  @IsObject()
  accountDetails: any
}
