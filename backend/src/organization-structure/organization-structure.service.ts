import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Position } from './schemas/position.schema';

@Injectable()
export class OrganizationStructureService {
  constructor(
    @InjectModel(Position.name) private positionModel: Model<Position>,
  ) {}

  /**
   * Gets all direct report positions for a given manager position.
   * Used by EmployeeProfileService to find team members.
   */
  async getDirectReportsByPosition(managerPositionId: Types.ObjectId): Promise<Position[]> {
    return this.positionModel
      .find({ reportsTo: managerPositionId })
      .exec();
  }
}

