import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [UsersModule,
    ConfigModule.forRoot(
      {
        load: [databaseConfig],
        envFilePath: '.env',
        isGlobal: true,
      }
    ),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.URI,
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
