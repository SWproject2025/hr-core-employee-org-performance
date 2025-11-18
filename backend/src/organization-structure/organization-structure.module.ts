import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from './schemas/department.schema';
import { Position, PositionSchema } from './schemas/position.schema';
import { OrganizationStructureService } from './organization-structure.service';
import { OrganizationStructureController } from './organization-structure.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
    ]),
  ],
  controllers: [OrganizationStructureController],
  providers: [OrganizationStructureService],
  exports: [MongooseModule, OrganizationStructureService],
})
export class OrganizationStructureModule {}

