import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types matching your schemas
export interface PayrollRun {
  _id: string;
  runId: string;
  payrollPeriod: Date;
  status: string; // PayRollStatus enum values
  entity: string;
  employees: number;
  exceptions: number;
  totalnetpay: number;
  payrollSpecialistId: string;
  paymentStatus: string; // PayRollPaymentStatus enum values
  payrollManagerId?: string;
  financeStaffId?: string;
  rejectionReason?: string;
  unlockReason?: string;
  managerApprovalDate?: Date;
  financeApprovalDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SigningBonus {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  signingBonusId: string;
  givenAmount: number;
  paymentDate?: Date;
  status: string; // BonusStatus enum values
  createdAt: Date;
  updatedAt: Date;
}

export interface Benefit {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  benefitId: string;
  terminationId: string;
  givenAmount: number;
  status: string; // BenefitStatus enum values
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeePayrollDetails {
  _id: string;
  employeeId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  netPay: number;
  bankStatus: string; // BankStatus enum values
  exceptions?: string;
  bonus?: number;
  benefit?: number;
  payrollRunId: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Service Object
const payrollService = {
  // ============ PAYROLL RUNS ============
  
  // Get all payroll runs with filters
  getAllPayrollRuns: async (filters: { status?: string; entity?: string; startDate?: string; endDate?: string } = {}) => {
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.entity) params.entity = filters.entity;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await api.get<PayrollRun[]>('/payroll-execution/payroll-runs', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all payroll runs:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get single payroll run by ID
  getPayrollRunById: async (id: string) => {
    try {
      const response = await api.get<PayrollRun>(`/payroll-execution/payroll-runs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching payroll run ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Create new payroll run (start payroll initiation)
  createPayrollRun: async (data: {
    runId: string;
    payrollPeriod: string;
    payrollSpecialistId: string;
    entity: string;
  }) => {
    try {
      const response = await api.post<PayrollRun>('/payroll-execution/payroll-runs/start', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating payroll run:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Delete payroll run (NOTE: You need to add this endpoint to your backend)
  deletePayrollRun: async (id: string) => {
    try {
      const response = await api.delete(`/payroll-execution/payroll-runs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting payroll run ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Edit payroll period
  editPayrollPeriod: async (id: string, payrollPeriod: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${id}/edit`, {
        payrollPeriod
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error editing payroll period for ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Validate payroll period
  validatePayrollPeriod: async (payrollPeriod: string) => {
    try {
      const response = await api.post('/payroll-execution/payroll-period/validate', {
        payrollPeriod
      });
      return response.data;
    } catch (error: any) {
      console.error('Error validating payroll period:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get suggested payroll period
  getSuggestedPayrollPeriod: async () => {
    try {
      const response = await api.get<{ payrollPeriod: string }>('/payroll-execution/payroll-period/suggested');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching suggested payroll period:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ SIGNING BONUSES ============
  
  // Get all pending signing bonuses
  getPendingSigningBonuses: async () => {
    try {
      const response = await api.get<SigningBonus[]>('/payroll-execution/signing-bonuses/pending');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending signing bonuses:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get signing bonus by ID
  getSigningBonusById: async (id: string) => {
    try {
      const response = await api.get<SigningBonus>(`/payroll-execution/signing-bonuses/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching signing bonus ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Approve signing bonus
  approveSigningBonus: async (id: string) => {
    try {
      const response = await api.patch<SigningBonus>(`/payroll-execution/signing-bonuses/${id}/approve`);
      return response.data;
    } catch (error: any) {
      console.error(`Error approving signing bonus ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Reject signing bonus
  rejectSigningBonus: async (id: string) => {
    try {
      const response = await api.patch<SigningBonus>(`/payroll-execution/signing-bonuses/${id}/reject`);
      return response.data;
    } catch (error: any) {
      console.error(`Error rejecting signing bonus ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Edit signing bonus
  editSigningBonus: async (id: string, givenAmount: number, paymentDate?: string) => {
    try {
      const payload: any = { givenAmount };
      if (paymentDate) payload.paymentDate = paymentDate;
      
      const response = await api.patch<SigningBonus>(`/payroll-execution/signing-bonuses/${id}/edit`, payload);
      return response.data;
    } catch (error: any) {
      console.error(`Error editing signing bonus ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ BENEFITS ============
  
  // Get all pending benefits
  getPendingBenefits: async () => {
    try {
      const response = await api.get<Benefit[]>('/payroll-execution/benefits/pending');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending benefits:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get benefit by ID
  getBenefitById: async (id: string) => {
    try {
      const response = await api.get<Benefit>(`/payroll-execution/benefits/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching benefit ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Approve benefit
  approveBenefit: async (id: string) => {
    try {
      const response = await api.patch<Benefit>(`/payroll-execution/benefits/${id}/approve`);
      return response.data;
    } catch (error: any) {
      console.error(`Error approving benefit ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Reject benefit
  rejectBenefit: async (id: string) => {
    try {
      const response = await api.patch<Benefit>(`/payroll-execution/benefits/${id}/reject`);
      return response.data;
    } catch (error: any) {
      console.error(`Error rejecting benefit ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Edit benefit
  editBenefit: async (id: string, givenAmount: number) => {
    try {
      const response = await api.patch<Benefit>(`/payroll-execution/benefits/${id}/edit`, {
        givenAmount
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error editing benefit ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ PRE-RUN CHECK ============
  
  // Check pre-run approvals
  checkPreRunApprovals: async () => {
    try {
      const response = await api.get('/payroll-execution/pre-run-check');
      return response.data;
    } catch (error: any) {
      console.error('Error checking pre-run approvals:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ APPROVALS & WORKFLOW ============
  
  // Publish draft for approval
  publishDraftForApproval: async (runId: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/publish`);
      return response.data;
    } catch (error: any) {
      console.error(`Error publishing draft ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Manager approve
  managerApprove: async (runId: string, approverId?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/manager-approve`, {
        approverId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error manager approving ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Manager reject
  managerReject: async (runId: string, reason: string, approverId?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/manager-reject`, {
        reason,
        approverId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error manager rejecting ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Finance approve
  financeApprove: async (runId: string, approverId?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/finance-approve`, {
        approverId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error finance approving ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Finance reject
  financeReject: async (runId: string, reason: string, approverId?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/finance-reject`, {
        reason,
        approverId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error finance rejecting ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get approvals by run ID
  getApprovalsByRunId: async (runId: string) => {
    try {
      const response = await api.get(`/payroll-execution/payroll-runs/${runId}/approvals`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching approvals for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ EXCEPTIONS ============
  
  // Get payroll run exceptions
  getPayrollRunExceptions: async (runId: string) => {
    try {
      const response = await api.get(`/payroll-execution/payroll-runs/${runId}/exceptions`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching exceptions for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Flag payroll exceptions
  flagPayrollExceptions: async (runId: string) => {
    try {
      const response = await api.post(`/payroll-execution/payroll-runs/${runId}/exceptions/flag`);
      return response.data;
    } catch (error: any) {
      console.error(`Error flagging exceptions for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Resolve exception
  resolveException: async (runId: string, employeeId: string, resolutionNote?: string) => {
    try {
      const response = await api.patch(
        `/payroll-execution/payroll-runs/${runId}/exceptions/${employeeId}/resolve`,
        { resolutionNote }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error resolving exception for employee ${employeeId} in run ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ PAYROLL ADJUSTMENTS ============
  
  // Create payroll adjustment
  createPayrollAdjustment: async (
    runId: string,
    employeeId: string,
    type: 'bonus' | 'deduction' | 'benefit',
    amount: number,
    reason?: string
  ) => {
    try {
      const response = await api.post(`/payroll-execution/payroll-runs/${runId}/adjustments`, {
        employeeId,
        type,
        amount,
        reason
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error creating adjustment for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ PAYSLIPS ============
  
  // Generate payslips
  generatePayslips: async (runId: string) => {
    try {
      const response = await api.post(`/payroll-execution/payroll-runs/${runId}/payslips/generate`);
      return response.data;
    } catch (error: any) {
      console.error(`Error generating payslips for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Distribute payslips
  distributePayslips: async (runId: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/payslips/distribute`);
      return response.data;
    } catch (error: any) {
      console.error(`Error distributing payslips for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Mark payroll as paid
  markPayrollAsPaid: async (runId: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/mark-paid`);
      return response.data;
    } catch (error: any) {
      console.error(`Error marking payroll as paid for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ REVIEW ============
  
  // Review payroll draft
  reviewPayrollDraft: async (runId: string) => {
    try {
      const response = await api.get(`/payroll-execution/payroll-runs/${runId}/review/draft`);
      return response.data;
    } catch (error: any) {
      console.error(`Error reviewing draft for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get payroll for manager review
  getPayrollForManagerReview: async (runId: string) => {
    try {
      const response = await api.get(`/payroll-execution/payroll-runs/${runId}/review/manager`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching manager review for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get payroll for finance review
  getPayrollForFinanceReview: async (runId: string) => {
    try {
      const response = await api.get(`/payroll-execution/payroll-runs/${runId}/review/finance`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching finance review for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ FREEZE/UNFREEZE ============
  
  // Freeze payroll
  freezePayroll: async (runId: string, reason?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/freeze`, {
        reason
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error freezing payroll ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Unfreeze payroll
  unfreezePayroll: async (runId: string, unlockReason?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/unfreeze`, {
        unlockReason
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error unfreezing payroll ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

export default payrollService;