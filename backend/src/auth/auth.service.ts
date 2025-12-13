import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmployeeProfile.name) private employeeModel: Model<EmployeeProfile>,
    private jwtService: JwtService,
  ) {}

  // 1. Validate User Credentials
  async validateUser(email: string, pass: string): Promise<any> {
    // Allow login by personalEmail, workEmail or nationalId
    // Explicitly select password since it's hidden by default
    const user = await this.employeeModel
      .findOne({
        $or: [
          { personalEmail: email },
          { workEmail: email },
          { nationalId: email },
        ],
      })
      .select('+password');
    
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  // 2. Login (Generate Token)
  async login(user: any) {
    const payload = { 
        email: user.email, 
        sub: user._id,
        roles: user.roles // Assuming your EmployeeProfile has a 'roles' field
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // 3. Register (Optional helper for seeding/testing)
  async register(registerDto: any) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = new this.employeeModel({
        ...registerDto,
        password: hashedPassword
    });
    return newUser.save();
  }
}