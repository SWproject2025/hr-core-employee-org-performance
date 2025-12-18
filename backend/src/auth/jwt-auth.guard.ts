import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // TEMPORARY FIX: Always return true to bypass JWT authentication during testing
    // TODO: Remove this and uncomment the line below when authentication is properly configured
    return true;
    
    // Original code (uncomment when you want auth back):
    // return super.canActivate(context);
  }
}