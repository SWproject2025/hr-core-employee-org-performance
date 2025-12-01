import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  JobTemplate,
  JobTemplateDocument,
} from './models/job-template.schema';
import {
  JobRequisition,
  JobRequisitionDocument,
} from './models/job-requisition.schema';
import {
  Application,
  ApplicationDocument,
} from './models/application.schema';
import {
  ApplicationStatusHistory,
  ApplicationStatusHistoryDocument,
} from './models/application-history.schema';
import {
  Interview,
  InterviewDocument,
} from './models/interview.schema';
import {
  AssessmentResult,
  AssessmentResultDocument,
} from './models/assessment-result.schema';
import {
  Referral,
  ReferralDocument,
} from './models/referral.schema';
import {
  Offer,
  OfferDocument,
} from './models/offer.schema';

import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';

import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';

import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStageDto } from './dto/update-application-stage.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { RejectApplicationDto } from './dto/reject-application.dto';
import { WithdrawApplicationDto } from './dto/withdraw-application.dto';
import { HoldApplicationDto } from './dto/hold-application.dto';

import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { CancelInterviewDto } from './dto/cancel-interview.dto';

import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { UpdateAssessmentResultDto } from './dto/update-assessment-result.dto';

import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferStatusDto } from './dto/update-offer-status.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';

import { ApplicationStage } from './enums/application-stage.enum';
import { ApplicationStatus } from './enums/application-status.enum';
import { InterviewStatus } from './enums/interview-status.enum';
import { OfferResponseStatus } from './enums/offer-response-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel(JobTemplate.name)
    private readonly jobTemplateModel: Model<JobTemplateDocument>,

    @InjectModel(JobRequisition.name)
    private readonly jobRequisitionModel: Model<JobRequisitionDocument>,

    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,

    @InjectModel(ApplicationStatusHistory.name)
    private readonly historyModel: Model<ApplicationStatusHistoryDocument>,

    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,

    @InjectModel(AssessmentResult.name)
    private readonly assessmentResultModel: Model<AssessmentResultDocument>,

    @InjectModel(Referral.name)
    private readonly referralModel: Model<ReferralDocument>,

    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
  ) {}

  // HISTORY LOGGER
  private async logHistory(
    applicationId: Types.ObjectId,
    oldStage: ApplicationStage,
    newStage: ApplicationStage,
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
    changedBy: string,
  ) {
    await this.historyModel.create({
      applicationId,
      oldStage,
      newStage,
      oldStatus,
      newStatus,
      changedBy,
    });
  }

  // BUSINESS RULES
  private validateStageOrder(
    oldStage: ApplicationStage,
    newStage: ApplicationStage,
  ) {
    const order = [
      ApplicationStage.SCREENING,
      ApplicationStage.DEPARTMENT_INTERVIEW,
      ApplicationStage.HR_INTERVIEW,
      ApplicationStage.OFFER,
    ];

    const oldIndex = order.indexOf(oldStage);
    const newIndex = order.indexOf(newStage);

    if (newIndex < oldIndex) {
      throw new BadRequestException('Cannot move backwards in stages');
    }

    if (newIndex > oldIndex + 1) {
      throw new BadRequestException('Cannot skip stages');
    }
  }

  private validateMoveToInterview(
    stage: ApplicationStage,
    requisition: JobRequisitionDocument,
  ) {
    if (
      stage === ApplicationStage.DEPARTMENT_INTERVIEW ||
      stage === ApplicationStage.HR_INTERVIEW
    ) {
      if (requisition.publishStatus === 'closed') {
        throw new BadRequestException(
          'Cannot move to interview stage because requisition is closed',
        );
      }
    }
  }

  // JOB TEMPLATES
  async createJobTemplate(dto: CreateJobTemplateDto) {
    return new this.jobTemplateModel(dto).save();
  }

  async findAllJobTemplates() {
    return this.jobTemplateModel.find().exec();
  }

  async findOneJobTemplate(id: string) {
    const template = await this.jobTemplateModel.findById(id).exec();
    if (!template) throw new NotFoundException('Job template not found');
    return template;
  }

  async updateJobTemplate(id: string, dto: UpdateJobTemplateDto) {
    const update = await this.jobTemplateModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) throw new NotFoundException('Job template not found');
    return update;
  }

  async removeJobTemplate(id: string) {
    const result = await this.jobTemplateModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Job template not found');
    return { deleted: true };
  }

  // JOB REQUISITIONS
  async createJobRequisition(dto: CreateJobRequisitionDto) {
    return new this.jobRequisitionModel(dto).save();
  }

  async findAllJobRequisitions() {
    return this.jobRequisitionModel.find().populate('templateId').exec();
  }

  async findOneJobRequisition(id: string) {
    const requisition = await this.jobRequisitionModel
      .findById(id)
      .populate('templateId')
      .exec();
    if (!requisition) throw new NotFoundException('Job requisition not found');
    return requisition;
  }

  async updateJobRequisition(id: string, dto: UpdateJobRequisitionDto) {
    const updated = await this.jobRequisitionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Job requisition not found');
    return updated;
  }

  async removeJobRequisition(id: string) {
    const result = await this.jobRequisitionModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Job requisition not found');
    return { deleted: true };
  }

  // APPLICATIONS
  async createApplication(dto: CreateApplicationDto) {
    const requisition = await this.findOneJobRequisition(dto.requisitionId);

    if (requisition.publishStatus === 'closed') {
      throw new BadRequestException('Cannot apply to closed requisition');
    }

    return new this.applicationModel({
      candidateId: dto.candidateId,
      requisitionId: dto.requisitionId,
      assignedHr: dto.assignedHr,
      currentStage: ApplicationStage.SCREENING,
      status: ApplicationStatus.SUBMITTED,
    }).save();
  }

  async findAllApplications() {
    return this.applicationModel.find().populate('requisitionId').exec();
  }

  async findOneApplication(id: string) {
    const app = await this.applicationModel
      .findById(id)
      .populate('requisitionId')
      .exec();
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async updateApplicationStatus(id: string, dto: UpdateApplicationStatusDto) {
    const app = await this.findOneApplication(id);

    const oldStatus = app.status;
    const newStatus = dto.newStatus;

    if (newStatus === ApplicationStatus.HIRED) {
      const acceptedOffer = await this.offerModel
        .findOne({
          applicationId: app._id,
          responseStatus: OfferResponseStatus.ACCEPTED,
        })
        .exec();

      if (!acceptedOffer) {
        throw new BadRequestException(
          'Cannot mark hired unless there is an accepted offer',
        );
      }

      if (app.currentStage !== ApplicationStage.OFFER) {
        throw new BadRequestException(
          'Cannot mark hired unless current stage is OFFER',
        );
      }
    }

    app.status = newStatus;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      newStatus,
      dto.changedBy,
    );

    return app;
  }

  async updateApplicationStage(id: string, dto: UpdateApplicationStageDto) {
    const app = await this.findOneApplication(id);
    const requisition = await this.findOneJobRequisition(
      app.requisitionId.toString(),
    );

    const oldStage = app.currentStage;
    const newStage = dto.newStage;

    this.validateStageOrder(oldStage, newStage);
    this.validateMoveToInterview(newStage, requisition);

    app.currentStage = newStage;
    app.status = ApplicationStatus.IN_PROCESS;

    await app.save();

    await this.logHistory(
      app._id,
      oldStage,
      newStage,
      ApplicationStatus.IN_PROCESS,
      ApplicationStatus.IN_PROCESS,
      dto.changedBy,
    );

    return app;
  }

  async rejectApplication(id: string, dto: RejectApplicationDto) {
    const app = await this.findOneApplication(id);
    const oldStatus = app.status;

    app.status = ApplicationStatus.REJECTED;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      ApplicationStatus.REJECTED,
      dto.changedBy,
    );

    return app;
  }

  async withdrawApplication(id: string, dto: WithdrawApplicationDto) {
    const app = await this.findOneApplication(id);
    const oldStatus = app.status;

    app.status = ApplicationStatus.REJECTED;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      ApplicationStatus.REJECTED,
      dto.changedBy,
    );

    return app;
  }

  async holdApplication(id: string, dto: HoldApplicationDto) {
    const app = await this.findOneApplication(id);
    const oldStatus = app.status;

    app.status = ApplicationStatus.IN_PROCESS;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      ApplicationStatus.IN_PROCESS,
      dto.changedBy,
    );

    return app;
  }

  async getApplicationHistory(applicationId: string) {
    return this.historyModel
      .find({
        applicationId: new Types.ObjectId(applicationId),
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  // INTERVIEWS
  async scheduleInterview(dto: CreateInterviewDto) {
    const app = await this.findOneApplication(dto.applicationId);

    if (app.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException(
        'Cannot schedule interview for a rejected application',
      );
    }

    if (app.currentStage === ApplicationStage.OFFER) {
      throw new BadRequestException(
        'Cannot schedule interview after offer stage',
      );
    }

    const interview = await this.interviewModel.create({
      applicationId: new Types.ObjectId(dto.applicationId),
      stage: dto.stage,
      scheduledDate: dto.scheduledDate,
      method: dto.method,
      panel: dto.panel.map((id) => new Types.ObjectId(id)),
      videoLink: dto.videoLink || '',
      calendarEventId: dto.calendarEventId || '',
      status: InterviewStatus.SCHEDULED,
    });

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      app.status,
      app.status,
      dto.changedBy,
    );

    return interview;
  }

  async updateInterview(id: string, dto: UpdateInterviewDto) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) throw new NotFoundException('Interview not found');

    if (dto.scheduledDate) interview.scheduledDate = dto.scheduledDate;
    if (dto.method) interview.method = dto.method;
    if (dto.panel) {
      interview.panel = dto.panel.map((id) => new Types.ObjectId(id));
    }
    if (dto.status) interview.status = dto.status;
    if (dto.videoLink) interview.videoLink = dto.videoLink;
    if (dto.calendarEventId) {
      interview.calendarEventId = dto.calendarEventId;
    }
    if (dto.candidateFeedback) {
      interview.candidateFeedback = dto.candidateFeedback;
    }

    await interview.save();
    return interview;
  }

  async cancelInterview(id: string, dto: CancelInterviewDto) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) throw new NotFoundException('Interview not found');

    interview.status = InterviewStatus.CANCELLED;
    interview.candidateFeedback = dto.reason;

    await interview.save();
    return interview;
  }

  async getInterviewsForApplication(applicationId: string) {
    return this.interviewModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .exec();
  }

  // ASSESSMENTS
  async createAssessmentResult(dto: CreateAssessmentResultDto) {
    const interview = await this.interviewModel
      .findById(dto.interviewId)
      .exec();
    if (!interview) throw new NotFoundException('Interview not found');

    const app = await this.findOneApplication(
      interview.applicationId.toString(),
    );

    if (app.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException(
        'Cannot add assessment for a rejected application',
      );
    }

    if (app.currentStage === ApplicationStage.OFFER) {
      throw new BadRequestException(
        'Cannot add assessment after offer stage',
      );
    }

    const assessment = await this.assessmentResultModel.create({
      interviewId: interview._id,
      interviewerId: new Types.ObjectId(dto.interviewerId),
      score: dto.score,
      comments: dto.comments || '',
    });

    interview.feedbackId = assessment._id;
    await interview.save();

    return assessment;
  }

  async updateAssessmentResult(
    id: string,
    dto: UpdateAssessmentResultDto,
  ) {
    const assessment = await this.assessmentResultModel.findById(id).exec();
    if (!assessment) {
      throw new NotFoundException('Assessment result not found');
    }

    if (dto.score !== undefined) {
      assessment.score = dto.score;
    }
    if (dto.comments !== undefined) {
      assessment.comments = dto.comments;
    }

    await assessment.save();
    return assessment;
  }

  async getAssessmentsForApplication(applicationId: string) {
    const interviews = await this.interviewModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .select('_id')
      .exec();

    if (!interviews.length) return [];

    const interviewIds = interviews.map((i) => i._id);
    return this.assessmentResultModel
      .find({ interviewId: { $in: interviewIds } })
      .exec();
  }

  async getAssessmentsForInterview(interviewId: string) {
    return this.assessmentResultModel
      .find({ interviewId: new Types.ObjectId(interviewId) })
      .exec();
  }

  // REFERRALS
  async createReferral(dto: CreateReferralDto) {
    const referral = await this.referralModel.create({
      referringEmployeeId: new Types.ObjectId(dto.referringEmployeeId),
      candidateId: new Types.ObjectId(dto.candidateId),
      role: dto.role,
      level: dto.level,
    });

    return referral;
  }

  async updateReferral(id: string, dto: UpdateReferralDto) {
    const referral = await this.referralModel.findById(id).exec();
    if (!referral) throw new NotFoundException('Referral not found');

    if (dto.role) referral.role = dto.role;
    if (dto.level) referral.level = dto.level;

    await referral.save();
    return referral;
  }

  async getReferral(id: string) {
    const referral = await this.referralModel.findById(id).exec();
    if (!referral) throw new NotFoundException('Referral not found');
    return referral;
  }

  async getReferralsForCandidate(candidateId: string) {
    return this.referralModel
      .find({ candidateId: new Types.ObjectId(candidateId) })
      .exec();
  }

  async getReferralsByEmployee(employeeId: string) {
    return this.referralModel
      .find({ referringEmployeeId: new Types.ObjectId(employeeId) })
      .exec();
  }

  // OFFERS
  async createOffer(dto: CreateOfferDto) {
    const app = await this.findOneApplication(dto.applicationId);

    if (app.currentStage !== ApplicationStage.OFFER) {
      throw new BadRequestException(
        'Cannot generate offer unless application is in OFFER stage',
      );
    }

    const offer = await this.offerModel.create({
      applicationId: new Types.ObjectId(dto.applicationId),
      candidateId: new Types.ObjectId(dto.candidateId),
    });

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      app.status,
      app.status,
      dto.changedBy,
    );

    return offer;
  }

  async updateOfferStatus(id: string, dto: UpdateOfferStatusDto) {
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    if (dto.responseStatus !== undefined) {
      (offer as any).responseStatus = dto.responseStatus;
    }
    if (dto.finalStatus !== undefined) {
      (offer as any).finalStatus = dto.finalStatus;
    }

    await offer.save();
    return offer;
  }

  async acceptOffer(id: string, dto: RespondOfferDto) {
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    (offer as any).responseStatus = OfferResponseStatus.ACCEPTED;
    (offer as any).finalStatus = OfferFinalStatus.APPROVED;
    offer.candidateSignedAt = new Date();

    await offer.save();

    const app = await this.findOneApplication(offer.applicationId.toString());
    const oldStatus = app.status;

    app.status = ApplicationStatus.HIRED;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      ApplicationStatus.HIRED,
      dto.changedBy,
    );

    // TODO: here you can hand off to onboarding module in MS3

    return offer;
  }

  async rejectOffer(id: string, dto: RespondOfferDto) {
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    (offer as any).responseStatus = OfferResponseStatus.REJECTED;
    (offer as any).finalStatus = OfferFinalStatus.REJECTED;

    await offer.save();

    const app = await this.findOneApplication(offer.applicationId.toString());
    const oldStatus = app.status;

    app.status = ApplicationStatus.REJECTED;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      ApplicationStatus.REJECTED,
      dto.changedBy,
    );

    return offer;
  }

  async getOfferForApplication(applicationId: string) {
    return this.offerModel
      .findOne({ applicationId: new Types.ObjectId(applicationId) })
      .exec();
  }
}
