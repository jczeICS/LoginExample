import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    readonly name: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    readonly password: string;

    @IsString()
    readonly phoneNumber?: string;
}
