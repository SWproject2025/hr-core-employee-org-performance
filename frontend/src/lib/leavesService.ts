/**
 * Centralized Leaves API Service
 * Handles all leave-related API calls with consistent error handling and authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper to get auth token
const getToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
};

// Helper for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ==================== EMPLOYEE ENDPOINTS ====================

export const leavesService = {
  // Get all leave types
  getLeaveTypes: () => apiCall<{ leaveTypes: any[] }>('/leaves/types'),

  // Get employee leave balance
  getLeaveBalance: (leaveTypeId?: string) => {
    const params = leaveTypeId ? `?leaveTypeId=${leaveTypeId}` : '';
    return apiCall<any[]>(`/leaves/balance${params}`);
  },

  // Get employee's leave requests
  getMyLeaveRequests: (status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      ...(status && { status }),
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiCall<{ requests: any[]; pagination: any }>(
      `/leaves/requests/my-requests?${params}`
    );
  },

  // Create leave request
  createLeaveRequest: (data: {
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    justification: string;
    attachmentId?: string;
  }) =>
    apiCall('/leaves/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get leave request details
  getLeaveRequestDetails: (requestId: string) =>
    apiCall(`/leaves/requests/${requestId}`),

  // Cancel leave request
  cancelLeaveRequest: (requestId: string) =>
    apiCall(`/leaves/requests/${requestId}/cancel`, {
      method: 'PATCH',
    }),

  // Update leave request
  updateLeaveRequest: (requestId: string, data: any) =>
    apiCall(`/leaves/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ==================== MANAGER ENDPOINTS ====================

  // Get pending leave requests for manager approval
  getPendingLeaveRequests: (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiCall<{ requests: any[]; pagination: any }>(
      `/leaves/requests/pending-approval?${params}`
    );
  },

  // Approve leave request (manager)
  approveLeaveRequestByManager: (requestId: string, comments?: string) =>
    apiCall(`/leaves/requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    }),

  // Reject leave request (manager)
  rejectLeaveRequestByManager: (requestId: string, reason: string) =>
    apiCall(`/leaves/requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // ==================== HR ADMIN ENDPOINTS ====================

  // Get all leave requests for HR
  getAllLeaveRequestsForHR: (status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      ...(status && status !== 'all' && { status }),
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiCall<{ requests: any[]; pagination: any }>(
      `/leaves/admin/requests?${params}`
    );
  },

  // Approve leave request (HR)
  approveLeaveRequestByHR: (requestId: string, comments?: string) =>
    apiCall(`/leaves/admin/requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    }),

  // Override rejected leave request (HR)
  overrideLeaveRequest: (requestId: string, comments?: string) =>
    apiCall(`/leaves/admin/requests/${requestId}/override`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    }),

  // Create leave adjustment
  createLeaveAdjustment: (data: {
    employeeId: string;
    leaveTypeId: string;
    adjustmentType: string;
    amount: number;
    reason: string;
  }) =>
    apiCall('/leaves/admin/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get employee leave balance (for HR)
  getEmployeeLeaveBalanceForHR: (employeeId: string, leaveTypeId?: string) => {
    const params = leaveTypeId ? `?leaveTypeId=${leaveTypeId}` : '';
    return apiCall(`/leaves/admin/employees/${employeeId}/balance${params}`);
  },

  // ==================== LEAVE POLICY ENDPOINTS ====================

  // Create leave type
  createLeaveType: (data: {
    code: string;
    name: string;
    categoryId: string;
    description?: string;
    paid?: boolean;
    deductible?: boolean;
  }) =>
    apiCall('/leaves/admin/types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Create leave policy
  createLeavePolicy: (data: {
    leaveTypeId: string;
    accrualMethod: string;
    monthlyRate?: number;
    yearlyRate?: number;
    carryForwardAllowed?: boolean;
    maxCarryForward?: number;
  }) =>
    apiCall('/leaves/admin/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Configure organizational calendar
  configureCalendar: (data: {
    year: number;
    holidays: any[];
    blockedPeriods?: any[];
  }) =>
    apiCall('/leaves/admin/calendar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ==================== CATEGORIES/BLOCK PERIODS ====================
  
  // Get leave policies
  getLeavePolicies: () => apiCall<any[]>('/leaves/admin/policies'),

  // Get leave categories
  getLeaveCategories: () => apiCall('/leaves/admin/categories'),

  // Create leave category
  createLeaveCategory: (data: { code: string; name: string; description?: string }) =>
    apiCall('/leaves/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Delete leave category
  deleteLeaveCategory: (id: string) =>
    apiCall(`/leaves/admin/categories/${id}`, { method: 'DELETE' }),

  // Get block periods
  getBlockPeriods: () => apiCall('/leaves/admin/block-periods'),

  // Create block period
  createBlockPeriod: (data: {
    name: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    exemptLeaveTypes?: string[];
  }) =>
    apiCall('/leaves/admin/block-periods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Delete block period
  deleteBlockPeriod: (id: string) =>
    apiCall(`/leaves/admin/block-periods/${id}`, { method: 'DELETE' }),

  // ==================== DELEGATION ====================

  // Set delegation
  setDelegation: (data: {
    delegateId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) =>
    apiCall('/leaves/delegation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get active delegations
  getActiveDelegations: () => apiCall<any[]>('/leaves/delegation/active'),

  // Get team members (for delegation dropdown)
  getTeamMembers: (managerId: string) => apiCall<any[]>(`/employee-profile/team/${managerId}`),
};

export default leavesService;
