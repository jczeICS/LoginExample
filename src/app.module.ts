import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
