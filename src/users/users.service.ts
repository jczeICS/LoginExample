import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
/* import { UpdateUserDto } from './dto/update-user.dto'; */
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

type Tokens = {
  access_token: string;
  refresh_token: string;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private jwtSvc: JwtService) { }
  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const createdUser = new this.userModel({ ...createUserDto, password: hashedPassword });
      const user = await createdUser.save();
      const { access_token, refresh_token } = await this.generateJwtToken(user);
      return {
        access_token,
        refresh_token,
        user: this.removePassword(user),
        status: HttpStatus.CREATED,
        message: 'user registered successfully'
      };
    } catch (error) {
      throw new HttpException('error internal server', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    return `This action returns all users`;
  }

  async loginUser(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email });
      const isPasswordValid = user && await bcrypt.compare(password, user.password);
      if (!isPasswordValid) throw new HttpException('please check your credentials', HttpStatus.UNAUTHORIZED);
      if (user && isPasswordValid) {
        const payload = {sub: user._id, email: user.email };
        const { access_token, refresh_token } = await this.generateJwtToken(payload);
        return {
          access_token,
          refresh_token,
          user: this.removePassword(user),
          status: HttpStatus.OK,
          message: 'login successful'
        }
      }
    } catch (error) {
      throw new HttpException('please check your credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const user = this.jwtSvc.verify(refreshToken, { secret: process.env.SECRET_kEY_JWT_REFRESH });
      const playLoad = { email: user.email, sub: user._id };
      const { access_token, refresh_token } = await this.generateJwtToken(playLoad);
      return { access_token, refresh_token, status: 200, message: 'token refreshed successfully' };
    } catch (error) {
      throw new HttpException('refresh token failed', HttpStatus.FORBIDDEN);
    }
  }

  private async generateJwtToken(user): Promise<Tokens> {
    const jwtplayload = {
      email: user.email, sub: user._id
    };
    const [acceess_token, refresh_token] = await Promise.all([
      this.jwtSvc.signAsync(jwtplayload, {
        secret: process.env.SECRET_KEY_JWT_CREATE,
        expiresIn: '1h',
      }),
      this.jwtSvc.signAsync(jwtplayload, {
        secret: process.env.SECRET_kEY_JWT_REFRESH,
        expiresIn: '1d',
      }),
    ])
    return {
      access_token: acceess_token,
      refresh_token: refresh_token,
    }
  }

  private removePassword(user) {
    const {password, ...result} = user.toObject();
    return result;
  }

}
