import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeProfileController } from './employee-profile.controller';
import { EmployeeProfileService } from './employee-profile.service';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateChangeRequestDto } from './dto/change-request.dto';

describe('EmployeeProfileController', () => {
  let controller: EmployeeProfileController;
  let service: EmployeeProfileService;

  // Mock the Service
  const mockService = {
    getProfile: jest.fn(),
    updateContactInfo: jest.fn(),
    submitChangeRequest: jest.fn(),
    getTeamProfiles: jest.fn(),
    approveChangeRequest: jest.fn(),
    rejectChangeRequest: jest.fn(),
    adminUpdateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeProfileController],
      providers: [
        { provide: EmployeeProfileService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<EmployeeProfileController>(EmployeeProfileController);
    service = module.get<EmployeeProfileService>(EmployeeProfileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateContactInfo', () => {
    it('should call service.updateContactInfo with correct parameters', async () => {
      const id = 'emp-1';
      const dto: UpdateContactDto = { phoneNumber: '123456789' };
      // FIX: Create a mock request object
      const mockReq = { user: { userId: 'user-1' } }; 

      mockService.updateContactInfo.mockResolvedValue('updated-profile');

      // FIX: Pass mockReq as the 3rd argument
      await controller.updateContactInfo(id, dto, mockReq);

      expect(service.updateContactInfo).toHaveBeenCalledWith(id, dto, 'user-1');
    });
  });

  describe('adminUpdate', () => {
    it('should call service.adminUpdateProfile with admin ID', async () => {
      const id = 'emp-1';
      const dto = { department: 'IT' };
      // FIX: Create a mock request object for Admin
      const mockReq = { user: { userId: 'admin-user' } };

      mockService.adminUpdateProfile.mockResolvedValue('updated-profile');

      // FIX: Pass mockReq as the 3rd argument
      await controller.adminUpdate(id, dto, mockReq);

      expect(service.adminUpdateProfile).toHaveBeenCalledWith(id, dto, 'admin-user');
    });
  });

  describe('submitChangeRequest', () => {
    it('should call service.submitChangeRequest', async () => {
      const id = 'emp-1';
      const dto: CreateChangeRequestDto = { changes: { address: 'New Place' }, reason: 'Moved' };

      mockService.submitChangeRequest.mockResolvedValue('request-submitted');

      await controller.submitChangeRequest(id, dto);

      expect(service.submitChangeRequest).toHaveBeenCalledWith(id, dto.changes, dto.reason);
    });
  });
});