import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

// Import Schemas
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { Candidate } from '../employee-profile/models/candidate.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmployeeProfile.name) private employeeModel: Model<EmployeeProfile>,
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    private jwtService: JwtService,
  ) {}

  // --- 1. Register (Create New Candidate) ---
  async register(registerDto: any) {
    const { email, password, firstName, lastName, nationalId, mobilePhone } = registerDto;

    // A. Check if email exists in Employees
    const existingEmployee = await this.employeeModel.findOne({ 
      $or: [{ workEmail: email }, { personalEmail: email }] 
    });
    if (existingEmployee) throw new ConflictException('Email already exists');

    // B. Check if email exists in Candidates
    const existingCandidate = await this.candidateModel.findOne({ personalEmail: email });
    if (existingCandidate) throw new ConflictException('Email already exists');

    // C. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ D. Generate Candidate Number (CRITICAL FIX)
    const candidateNumber = `CAN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // E. Create Candidate
    const newCandidate = new this.candidateModel({
      firstName,
      lastName,
      personalEmail: email,
      password: hashedPassword,
      nationalId: nationalId, // Required by Schema
      candidateNumber: candidateNumber, // <--- This was missing!
      mobilePhone: mobilePhone || '',
      status: 'APPLIED',
      applicationDate: new Date()
    });

    await newCandidate.save();

    return { message: 'Registration successful. You can now login.' };
  }

  // --- 2. Validate User (Universal Login) ---
  async validateUser(email: string, pass: string): Promise<any> {
    let user: any = null;
    let userType = '';

    // A. Check EMPLOYEE Collection
    user = await this.employeeModel.findOne({
      $or: [
        { workEmail: email }, 
        { personalEmail: email }
      ]
    }).select('+password'); 

    if (user) {
      userType = 'EMPLOYEE';
    } 
    // B. Check CANDIDATE Collection
    else {
      user = await this.candidateModel.findOne({ personalEmail: email }).select('+password');
      if (user) {
        userType = 'CANDIDATE';
      }
    }

    if (!user) return null;

    // C. Check Password
    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      const { password, ...result } = user.toObject();
      return { ...result, userType };
    }

    return null;
  }

  // --- 3. Login (Generate Token) ---
  async login(user: any) {
    const payload = { 
      email: user.personalEmail || user.workEmail, 
      sub: user._id,
      type: user.userType 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.workEmail || user.personalEmail,
        type: user.userType
      }
    };
  }
}