import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  userId: string;
  employeeProfileId: string;
  email: string;
  roles: string[];
  // Add other fields you need
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    // This comes from your JWT strategy
    // Ensure employeeProfileId is always set (fallback to userId)
    const user = request.user || {};
    return {
      ...user,
      employeeProfileId: user.employeeProfileId || user.userId || user.sub,
      userId: user.userId || user.sub || user.employeeProfileId,
    };
  },
);