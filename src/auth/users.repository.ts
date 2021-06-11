/* eslint-disable prettier/prettier */
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    //hash
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const user = this.create({ username, password: hashPassword });

    try {
      await this.save(user);
    } catch (err) {
      if (err.code === '23505') {
        //duplicate username
        throw new ConflictException('Username has been exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
