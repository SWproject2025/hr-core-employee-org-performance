import { Test } from '@nestjs/testing';
import { EmployeeProfileController } from './employee-profile.controller';
import { EmployeeProfileService } from './employee-profile.service';

describe('EmployeeProfileController', () => {
  let controller: EmployeeProfileController;
  let service: EmployeeProfileService;

  // Mock the entire Service
  const mockEmployeeService = {
    getProfile: jest.fn(),
    updateContactInfo: jest.fn(),
    submitChangeRequest: jest.fn(),
    getTeamProfiles: jest.fn(),
    approveChangeRequest: jest.fn(),
    rejectChangeRequest: jest.fn(),
    adminUpdateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [EmployeeProfileController],
      providers: [
        {
          provide: EmployeeProfileService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeProfileController>(EmployeeProfileController);
    service = module.get<EmployeeProfileService>(EmployeeProfileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should call service.getProfile', async () => {
      mockEmployeeService.getProfile.mockResolvedValue({ name: 'John' });
      await controller.getProfile('123');
      expect(service.getProfile).toHaveBeenCalledWith('123');
    });
  });

  describe('updateContactInfo', () => {
    it('should call service.updateContactInfo', async () => {
      const dto = { phoneNumber: '123456' };
      await controller.updateContactInfo('123', dto);
      expect(service.updateContactInfo).toHaveBeenCalledWith('123', dto);
    });
  });

  describe('approveRequest', () => {
    it('should call service.approveChangeRequest', async () => {
      await controller.approveRequest('reqId', 'adminId');
      expect(service.approveChangeRequest).toHaveBeenCalledWith('reqId', 'adminId');
    });
  });

  describe('getTeam', () => {
    it('should call service.getTeamProfiles', async () => {
      await controller.getTeam('manager1');
      expect(service.getTeamProfiles).toHaveBeenCalledWith('manager1');
    });
  });
});