import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole } from '../employee-profile/models/employee-system-role.schema';
import { EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmployeeProfile.name) private employeeModel: Model<EmployeeProfile>,
    @InjectModel(EmployeeSystemRole.name) private systemRoleModel: Model<EmployeeSystemRole>,
    private jwtService: JwtService,
  ) { }

  // 1. Validate User Credentials
  async validateUser(email: string, pass: string): Promise<any> {
    // Try to find user by workEmail first, then personalEmail
    const user = await this.employeeModel.findOne({
      $or: [
        { workEmail: email },
        { personalEmail: email },
      ],
    }).select('+password');

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Get user roles from EmployeeSystemRole collection
    const systemRole = await this.systemRoleModel.findOne({
      employeeProfileId: user._id,
      isActive: true,
    }).exec();

    const roles = systemRole?.roles || [];

    const { password, ...result } = user.toObject();
    return {
      ...result,
      roles,
      employeeProfileId: user._id.toString(),
    };
  }

  // 2. Login (Generate Token)
  async login(user: any) {
    const email = user.workEmail || user.personalEmail || '';
    const payload = {
      email,
      sub: user._id,
      employeeProfileId: user.employeeProfileId || user._id.toString(),
      roles: user.roles || [],
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // 3. Register (Optional helper for seeding/testing)
  async register(registerDto: any) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate unique employee number
    const employeeNumber = await this.generateEmployeeNumber();

    // Set dateOfHire to current date if not provided
    const dateOfHire = registerDto.dateOfHire ? new Date(registerDto.dateOfHire) : new Date();

    const newUser = new this.employeeModel({
      ...registerDto,
      password: hashedPassword,
      employeeNumber,
      dateOfHire,
      status: registerDto.status || EmployeeStatus.ACTIVE, // Default to ACTIVE if not provided
    });
    return newUser.save();
  }

  // Helper method to generate unique employee number
  private async generateEmployeeNumber(): Promise<string> {
    // Find all employees with EMP-XXX pattern
    const employees = await this.employeeModel
      .find({ employeeNumber: { $regex: /^EMP-\d+$/ } })
      .select('employeeNumber')
      .exec();

    if (!employees || employees.length === 0) {
      // If no employees exist, start with EMP-001
      return 'EMP-001';
    }

    // Extract numbers and find the maximum
    let maxNumber = 0;
    for (const emp of employees) {
      const match = emp.employeeNumber?.match(/^EMP-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    // Increment and format
    const nextNumber = maxNumber + 1;
    return `EMP-${nextNumber.toString().padStart(3, '0')}`;
  }
}