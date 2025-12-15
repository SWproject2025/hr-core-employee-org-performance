import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; // Import JWT Service
import { Candidate } from '../employee-profile/models/candidate.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    private jwtService: JwtService, // Inject JWT Service
  ) {}

  // --- 1. Validate User (Used by LocalStrategy or Login) ---
  async validateUser(email: string, pass: string): Promise<any> {
    // Find user by personalEmail (since that's what we used for registration)
    const user = await this.candidateModel.findOne({ personalEmail: email });
    
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Strip password from result
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  // --- 2. Login (Generate Token) ---
  async login(user: any) {
    const payload = { 
      email: user.personalEmail, 
      sub: user._id, 
      role: 'CANDIDATE' // Default role
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.personalEmail
      }
    };
  }

  // --- 3. Register (Create Candidate) ---
  async register(registerDto: any) {
    const existing = await this.candidateModel.findOne({
      $or: [{ personalEmail: registerDto.personalEmail }, { nationalId: registerDto.nationalId }]
    });
    
    if (existing) {
      throw new BadRequestException('User with this Email or National ID already exists');
    }

    const candidateNumber = `CAN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newCandidate = new this.candidateModel({
      ...registerDto,
      candidateNumber: candidateNumber,
      password: hashedPassword,
      status: 'APPLIED',
      applicationDate: new Date()
    });

    return newCandidate.save();
  }
}