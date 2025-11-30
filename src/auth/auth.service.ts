import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../employee-profile/models/employee-system-role.schema';
import { SystemRole, EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import { JwtPayload } from './strategies/jwt.strategy';
import { RegisterDto } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(EmployeeSystemRole.name)
    private employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(nationalId: string, password: string): Promise<any> {
    const employeeProfile = await this.employeeProfileModel.findOne({ nationalId });

    if (!employeeProfile || !employeeProfile.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, employeeProfile.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const systemRole = await this.employeeSystemRoleModel.findOne({
      employeeProfileId: employeeProfile._id,
      isActive: true,
    });

    return {
      employeeProfileId: employeeProfile._id.toString(),
      nationalId: employeeProfile.nationalId,
      roles: systemRole?.roles || [],
      permissions: systemRole?.permissions || [],
    };
  }

  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.employeeProfileId,
      nationalId: user.nationalId,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        employeeProfileId: user.employeeProfileId,
        nationalId: user.nationalId,
        roles: user.roles,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async register(registerDto: RegisterDto): Promise<any> {
    // Check if user already exists
    const existingUser = await this.employeeProfileModel.findOne({
      $or: [
        { nationalId: registerDto.nationalId },
        { employeeNumber: registerDto.employeeNumber },
      ],
    });

    if (existingUser) {
      throw new ConflictException('User with this national ID or employee number already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Create employee profile
    const employeeProfile = await this.employeeProfileModel.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      fullName: `${registerDto.firstName} ${registerDto.lastName}`,
      nationalId: registerDto.nationalId,
      password: hashedPassword,
      employeeNumber: registerDto.employeeNumber,
      dateOfHire: new Date(),
      status: EmployeeStatus.ACTIVE,
      workEmail: registerDto.workEmail,
      personalEmail: registerDto.personalEmail,
    });

    // Create default system role (Department Employee)
    const systemRole = await this.employeeSystemRoleModel.create({
      employeeProfileId: employeeProfile._id,
      roles: [SystemRole.DEPARTMENT_EMPLOYEE],
      permissions: [],
      isActive: true,
    });

    return {
      employeeProfileId: employeeProfile._id.toString(),
      nationalId: employeeProfile.nationalId,
      roles: systemRole.roles,
      permissions: systemRole.permissions,
    };
  }
}

