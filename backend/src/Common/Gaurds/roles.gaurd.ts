import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import { ROLE_KEY } from '../Decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // TEMPORARY FIX: Always return true to bypass role checking during testing
        // TODO: Remove this early return when authentication is properly configured
        
        const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        //free for all
        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.roles?.includes(role));
        
    }
}