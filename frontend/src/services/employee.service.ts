import api from '@/lib/axios';
import { ChangePasswordDto, EmployeeProfile, UpdateContactDto } from '@/types/employee';

export const EmployeeService = {
  // Get My Profile
  getMe: async () => {
    const { data } = await api.get<{ profile: EmployeeProfile;MQ: any }>('/employee-profile/me');
    return data;
  },

  // Get Specific Profile
  getProfile: async (id: string) => {
    const { data } = await api.get<EmployeeProfile>(`/employee-profile/${id}`);
    return data;
  },

  // Update Contact Info (Self-Service)
  updateContact: async (id: string, data: UpdateContactDto) => {
    const response = await api.put<EmployeeProfile>(`/employee-profile/${id}/contact`, data);
    return response.data;
  },

  // Change Password
  changePassword: async (data: ChangePasswordDto) => {
    return await api.put('/employee-profile/me/password', data);
  },

  // Get Team (Manager View)
  getTeam: async (managerId: string) => {
    const { data } = await api.get<EmployeeProfile[]>(`/employee-profile/team/${managerId}`);
    return data;
  },

  // Search Employees (Admin)
  search: async (query: string) => {
    const { data } = await api.get<EmployeeProfile[]>(`/employee-profile/search?q=${query}`);
    return data;
  },

  // Upload Profile Picture
  uploadPhoto: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post<EmployeeProfile>(
      `/employee-profile/${id}/upload-photo`, 
      formData, 
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  }
};