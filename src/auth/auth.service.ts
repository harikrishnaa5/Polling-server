import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async comparePassword(password: string, hash: string) {
    const comparePass = await bcrypt.compare(password, hash);
    if (!comparePass) throw new UnauthorizedException('Invalid password');
  }

  // async hashPassword(password: string): Promise<string> {
  //   try {
  //     const salt = 10;
  //     const hashedPassword = await bcrypt.hash(password, salt);
  //     return hashedPassword;
  //   } catch (error) {
  //     console.error('Error while hashing password');
  //     throw error;
  //   }
  // }
  async register(registerDto: RegisterDto) {
    const { fullName, email, password } = registerDto;
    const existingUser = await this.userService.getUser(email);
    if (existingUser)
      throw new ConflictException(
        `The email "${email}" is already registered.`,
      );
    const hashedPassword = await bcrypt.hash(password, 12);
    await this.userService.createUser({
      email,
      fullName,
      password: hashedPassword,
    });
    return { message: 'User created successfully', status: "Success" };
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userService.getUser(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    await this.comparePassword(password, user.password);
    const payload = { userId: user._id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return { access_token: token, message: "Log in Successful", status: "Success" };
  }
}
