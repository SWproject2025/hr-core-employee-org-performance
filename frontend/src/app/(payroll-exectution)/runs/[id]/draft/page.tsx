"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  User,
  DollarSign,
  AlertCircle,
  Send,
  FileText,
  TrendingUp,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  CreditCard,
  Activity,
  RefreshCw,
  CheckSquare,
  Edit3,
  Plus,
  Minus,
  Gift,
  X,
  Check,
  Eye
} from 'lucide-react';
import { useParams } from 'next/navigation';

const API_URL = "http://localhost:3000";

// Types
interface PayrollRun {
  runId: string;
  period: {
    month: string;
    year: number;
    startDate: string;
    endDate: string;
  };
  status: string;
  statistics: {
    totalEmployees: number;
    withExceptions: number;
    totalGross: number;
    totalNet: number;
    totalDeductions: number;
  };
  employees: Employee[];
}

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  baseSalary: number;
  allowances: number;
  grossSalary: number;
  taxes: number;
  insurance: number;
  penalties: number;
  netSalary: number;
  workingDays: number;
  absentDays: number;
  overtimeHours: number;
  bonus: number;
  benefit: number;
  exceptions: Exception[] | null;
}

interface Exception {
  type: string;
  severity: string;
  message: string;
  flaggedAt: string;
}

interface PreRunItem {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  type: string;
  status: string;
  givenAmount: number;
  paymentDate?: string;
}

interface AdjustmentModalData {
  employeeId: string;
  employeeName: string;
  type: 'bonus' | 'deduction' | 'benefit';
  amount: number;
  reason: string;
}

const PayrollDraftPage = () => {
  const { id } = useParams();
  const runId = id as string;
  
  // State
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [preRunItems, setPreRunItems] = useState<PreRunItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'employees' | 'prerun'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterException, setFilterException] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Modal State
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  // Adjustment Modal
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState<AdjustmentModalData>({
    employeeId: '',
    employeeName: '',
    type: 'bonus',
    amount: 0,
    reason: ''
  });
  const [adjusting, setAdjusting] = useState(false);
  
  // Pre-run Item Edit Modal
  const [showEditPreRunModal, setShowEditPreRunModal] = useState(false);
  const [editingPreRunItem, setEditingPreRunItem] = useState<PreRunItem | null>(null);
  const [editAmount, setEditAmount] = useState(0);
  const [editingPreRun, setEditingPreRun] = useState(false);

  useEffect(() => {
    if (runId) {
      fetchPayrollDraft();
      fetchPreRunItems();
    }
  }, [runId]);

  const fetchPayrollDraft = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!runId) {
        setError('No run ID provided in URL');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/review/draft`
      );

      const runData = response.data;
      
      const transformedData: PayrollRun = {
        runId: runData.run.runId,
        period: {
          month: new Date(runData.run.payrollPeriod).toLocaleString('default', { month: 'long' }),
          year: new Date(runData.run.payrollPeriod).getFullYear(),
          startDate: runData.run.payrollPeriod,
          endDate: runData.run.payrollPeriod
        },
        status: runData.run.status,
        statistics: {
          totalEmployees: runData.summary.employees,
          withExceptions: runData.summary.exceptions,
          totalGross: runData.employees.reduce((sum: number, emp: any) => {
            return sum + (emp.baseSalary || 0) + (emp.allowances || 0) + (emp.bonus || 0) + (emp.benefit || 0);
          }, 0),
          totalNet: runData.summary.totalNetPay,
          totalDeductions: runData.employees.reduce((sum: number, emp: any) => sum + (emp.deductions || 0), 0)
        },
        employees: transformEmployees(runData.employees)
      };
      
      setPayrollRun(transformedData);
      setEmployees(transformedData.employees);
    } catch (err: any) {
      console.error('Failed to fetch payroll draft:', err);
      setError(err.response?.data?.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreRunItems = async () => {
    try {
      const [bonusesRes, benefitsRes] = await Promise.all([
        axios.get(`${API_URL}/payroll-execution/signing-bonuses/pending`),
        axios.get(`${API_URL}/payroll-execution/benefits/pending`)
      ]);

      const allItems: PreRunItem[] = [
        ...bonusesRes.data.map((b: any) => ({ ...b, type: 'Signing Bonus' })),
        ...benefitsRes.data.map((b: any) => ({ ...b, type: b.benefitType || 'Benefit' }))
      ];

      setPreRunItems(allItems);
    } catch (err) {
      console.error('Failed to fetch pre-run items:', err);
    }
  };

  const transformEmployees = (employeesData: any[]): Employee[] => {
    return employeesData.map(emp => {
      const employeeInfo = emp.employeeId || {};
      const baseSalary = emp.baseSalary || 0;
      const allowances = emp.allowances || 0;
      const bonus = emp.bonus || 0;
      const benefit = emp.benefit || 0;
      const grossSalary = baseSalary + allowances + bonus + benefit;
      const deductions = emp.deductions || 0;
      const netSalary = emp.netPay || 0;
      
      let exceptions: Exception[] | null = null;
      if (emp.exceptions && typeof emp.exceptions === 'string' && !emp.exceptions.includes('RESOLVED:')) {
        exceptions = [{
          type: 'GENERAL_EXCEPTION',
          severity: 'MEDIUM',
          message: emp.exceptions,
          flaggedAt: new Date().toISOString()
        }];
      }

      return {
        id: emp.employeeId?._id || emp._id,
        name: employeeInfo.firstName && employeeInfo.lastName 
          ? `${employeeInfo.firstName} ${employeeInfo.lastName}` 
          : 'Unknown Employee',
        department: employeeInfo.primaryDepartmentId?.name || employeeInfo.department || 'N/A',
        position: employeeInfo.jobTitle || 'N/A',
        baseSalary,
        allowances,
        grossSalary,
        taxes: Math.floor(deductions * 0.5),
        insurance: Math.floor(deductions * 0.3),
        penalties: Math.floor(deductions * 0.2),
        netSalary,
        workingDays: emp.workingDays || 22,
        absentDays: emp.absentDays || 0,
        overtimeHours: emp.overtimeHours || 0,
        bonus,
        benefit,
        exceptions
      };
    });
  };

  // ============ ADJUSTMENT HANDLERS ============
  
  const openAdjustmentModal = (employee: Employee, type: 'bonus' | 'deduction' | 'benefit') => {
    setAdjustmentData({
      employeeId: employee.id,
      employeeName: employee.name,
      type,
      amount: 0,
      reason: ''
    });
    setShowAdjustmentModal(true);
  };

  const handleCreateAdjustment = async () => {
    if (!adjustmentData.amount || adjustmentData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!adjustmentData.reason.trim()) {
      alert('Please provide a reason for the adjustment');
      return;
    }

    try {
      setAdjusting(true);
      
      await axios.post(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/adjustments`,
        {
          employeeId: adjustmentData.employeeId,
          type: adjustmentData.type,
          amount: adjustmentData.amount,
          reason: adjustmentData.reason
        }
      );
      
      alert(`${adjustmentData.type.charAt(0).toUpperCase() + adjustmentData.type.slice(1)} adjustment created successfully!`);
      setShowAdjustmentModal(false);
      setAdjustmentData({ employeeId: '', employeeName: '', type: 'bonus', amount: 0, reason: '' });
      fetchPayrollDraft();
    } catch (err: any) {
      console.error('Failed to create adjustment:', err);
      alert(err.response?.data?.message || 'Failed to create adjustment');
    } finally {
      setAdjusting(false);
    }
  };

  // ============ PRE-RUN ITEM HANDLERS ============

  const handleApprovePreRunItem = async (item: PreRunItem) => {
    try {
      const endpoint = item.type === 'Signing Bonus'
        ? `${API_URL}/payroll-execution/signing-bonuses/${item._id}/approve`
        : `${API_URL}/payroll-execution/benefits/${item._id}/approve`;
      
      await axios.patch(endpoint);
      alert('Item approved successfully!');
      fetchPreRunItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve item');
    }
  };

  const handleRejectPreRunItem = async (item: PreRunItem) => {
    try {
      const endpoint = item.type === 'Signing Bonus'
        ? `${API_URL}/payroll-execution/signing-bonuses/${item._id}/reject`
        : `${API_URL}/payroll-execution/benefits/${item._id}/reject`;
      
      await axios.patch(endpoint);
      alert('Item rejected successfully!');
      fetchPreRunItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject item');
    }
  };

  const openEditPreRunModal = (item: PreRunItem) => {
    setEditingPreRunItem(item);
    setEditAmount(item.givenAmount);
    setShowEditPreRunModal(true);
  };

  const handleEditPreRunItem = async () => {
    if (!editingPreRunItem) return;
    if (editAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setEditingPreRun(true);
      
      const endpoint = editingPreRunItem.type === 'Signing Bonus'
        ? `${API_URL}/payroll-execution/signing-bonuses/${editingPreRunItem._id}/edit`
        : `${API_URL}/payroll-execution/benefits/${editingPreRunItem._id}/edit`;
      
      await axios.patch(endpoint, { givenAmount: editAmount });
      
      alert('Item updated successfully!');
      setShowEditPreRunModal(false);
      setEditingPreRunItem(null);
      fetchPreRunItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update item');
    } finally {
      setEditingPreRun(false);
    }
  };

  // ============ EXCEPTION HANDLERS ============

  const handleResolveException = async (employeeId: string) => {
    if (!resolutionNote.trim()) {
      alert('Please provide a resolution note');
      return;
    }
    
    try {
      setResolving(true);
      
      await axios.patch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions/${employeeId}/resolve`,
        { resolutionNote }
      );
      
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { ...emp, exceptions: null } : emp
      ));
      
      if (payrollRun) {
        setPayrollRun(prev => prev ? {
          ...prev,
          statistics: {
            ...prev.statistics,
            withExceptions: employees.filter(e => e.id !== employeeId && e.exceptions).length
          }
        } : null);
      }
      
      setSelectedEmployee(null);
      setResolutionNote('');
      alert('Exception resolved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve exception');
    } finally {
      setResolving(false);
    }
  };

  // ============ PUBLISH HANDLER ============

  const handlePublishForApproval = async () => {
    const exceptionsCount = employees.filter(e => e.exceptions).length;
    const pendingPreRunCount = preRunItems.filter(i => i.status === 'PENDING').length;
    
    if (pendingPreRunCount > 0) {
      alert(`There are ${pendingPreRunCount} pending pre-run items. Please approve or reject them before publishing.`);
      return;
    }
    
    if (exceptionsCount > 0) {
      if (!window.confirm(`There are ${exceptionsCount} unresolved exceptions. Do you want to continue publishing for approval?`)) {
        return;
      }
    }
    
    try {
      setPublishing(true);
      await axios.patch(`${API_URL}/payroll-execution/payroll-runs/${runId}/publish`);
      alert('Payroll successfully published for manager and finance approval!');
      await fetchPayrollDraft();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish payroll for approval');
    } finally {
      setPublishing(false);
    }
  };

  // ============ UI HELPERS ============

  const toggleRowExpansion = (employeeId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const getExceptionBadge = (exceptions: Exception[] | null) => {
    if (!exceptions || exceptions.length === 0) return null;
    const severity = exceptions[0].severity;
    const colors: Record<string, string> = {
      HIGH: 'bg-red-100 text-red-800 border-red-300',
      MEDIUM: 'bg-orange-100 text-orange-800 border-orange-300',
      LOW: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${colors[severity] || colors.MEDIUM}`}>
        <AlertTriangle size={12} />
        {exceptions.length} Exception{exceptions.length > 1 ? 's' : ''}
      </span>
    );
  };

  const getExceptionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MISSING_BANK_ACCOUNT: 'Missing Bank Account',
      NEGATIVE_NET_PAY: 'Negative Net Pay',
      SALARY_SPIKE: 'Unusual Salary Spike',
      MISSING_TAX_INFO: 'Missing Tax Information',
      GENERAL_EXCEPTION: 'Exception Flagged'
    };
    return labels[type] || type.replace(/_/g, ' ');
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesException = filterException === 'all' || 
                            (filterException === 'with' && emp.exceptions) ||
                            (filterException === 'without' && !emp.exceptions);
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    
    return matchesSearch && matchesException && matchesDepartment;
  });

  const departments = [...new Set(employees.map(e => e.department))];
  const exceptionsCount = employees.filter(e => e.exceptions).length;
  const pendingPreRunCount = preRunItems.filter(i => i.status === 'PENDING').length;

  // ============ RENDER ============

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading payroll draft...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Payroll</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPayrollDraft}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!payrollRun) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Draft Payroll Found</h2>
          <p className="text-gray-600">There are no payroll drafts available for review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText size={32} className="text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Payroll Draft Review</h1>
              </div>
              <p className="text-gray-600 ml-11">
                {payrollRun.period.month} {payrollRun.period.year} • Run ID: {payrollRun.runId}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { fetchPayrollDraft(); fetchPreRunItems(); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-200">
                STATUS: {payrollRun.status.toUpperCase()}
              </span>
              <button
                onClick={handlePublishForApproval}
                disabled={publishing || pendingPreRunCount > 0}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
              >
                <Send size={20} />
                {publishing ? 'Publishing...' : 'Send for Approval'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Users size={24} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Employees</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{payrollRun.statistics.totalEmployees}</p>
          </div>
          
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle size={24} className="text-orange-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Exceptions</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{exceptionsCount}</p>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Gift size={24} className="text-purple-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Pending Pre-Run</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{pendingPreRunCount}</p>
          </div>
          
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp size={24} className="text-green-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Gross</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${payrollRun.statistics.totalGross.toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <DollarSign size={24} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Net</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${payrollRun.statistics.totalNet.toLocaleString()}</p>
          </div>
        </div>

        {/* Alerts */}
        {pendingPreRunCount > 0 && (
          <div className="bg-purple-50 border-l-4 border-purple-500 p-5 mb-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <Gift className="text-purple-600 flex-shrink-0 mt-0.5" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 text-lg mb-1">
                  {pendingPreRunCount} Pre-Run Item{pendingPreRunCount !== 1 ? 's' : ''} Pending
                </h3>
                <p className="text-sm text-purple-700">
                  You must approve or reject all pre-run items (signing bonuses, termination benefits) before publishing.
                </p>
              </div>
            </div>
          </div>
        )}

        {exceptionsCount > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-5 mb-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 text-lg mb-1">
                  {exceptionsCount} Exception{exceptionsCount !== 1 ? 's' : ''} Require Attention
                </h3>
                <p className="text-sm text-orange-700">
                  Review and resolve exceptions before publishing for approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('employees')}
                className={`px-6 py-4 font-medium text-sm transition ${
                  activeTab === 'employees'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  Employee Payroll ({employees.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('prerun')}
                className={`px-6 py-4 font-medium text-sm transition ${
                  activeTab === 'prerun'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Gift size={18} />
                  Pre-Run Items ({preRunItems.length})
                  {pendingPreRunCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {pendingPreRunCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Employee Tab Content */}
          {activeTab === 'employees' && (
            <>
              {/* Filters */}
              <div className="p-5 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Search Employee</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Exception Filter</label>
                    <select
                      value={filterException}
                      onChange={(e) => setFilterException(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Employees</option>
                      <option value="with">With Exceptions</option>
                      <option value="without">Without Exceptions</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Employee Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase">Employee</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase">Department</th>
                      <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase">Gross</th>
                      <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase">Deductions</th>
                      <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase">Net</th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => (
                      <React.Fragment key={employee.id}>
                        <tr className={`hover:bg-gray-50 ${employee.exceptions ? 'bg-orange-50' : ''}`}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User size={20} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{employee.name}</p>
                                <p className="text-xs text-gray-500">{employee.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Building2 size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-700">{employee.department}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right font-semibold text-gray-900">
                            ${employee.grossSalary.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-right text-red-600 font-semibold">
                            -${(employee.taxes + employee.insurance + employee.penalties).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-green-600 text-lg">
                            ${employee.netSalary.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {getExceptionBadge(employee.exceptions) || (
                              <CheckCircle size={20} className="text-green-500 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => toggleRowExpansion(employee.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                {expandedRows.has(employee.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                              <button
                                onClick={() => openAdjustmentModal(employee, 'bonus')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                title="Add Bonus"
                              >
                                <Plus size={18} />
                              </button>
                              <button
                                onClick={() => openAdjustmentModal(employee, 'deduction')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Add Deduction"
                              >
                                <Minus size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Row */}
                        {expandedRows.has(employee.id) && (
                          <tr className="bg-gray-50">
                            <td colSpan={7} className="px-4 py-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Salary Breakdown */}
                                <div className="bg-white rounded-lg p-5 border border-gray-200">
                                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard size={18} />
                                    Salary Breakdown
                                  </h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b">
                                      <span className="text-gray-600">Base Salary</span>
                                      <span className="font-semibold">${employee.baseSalary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b">
                                      <span className="text-gray-600">Allowances</span>
                                      <span className="font-semibold text-green-600">+${employee.allowances.toLocaleString()}</span>
                                    </div>
                                    {employee.bonus > 0 && (
                                      <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-gray-600">Bonus</span>
                                        <span className="font-semibold text-green-600">+${employee.bonus.toLocaleString()}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center pb-2 border-b">
                                      <span className="font-semibold">Gross Salary</span>
                                      <span className="font-bold">${employee.grossSalary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b">
                                      <span className="text-gray-600">Taxes</span>
                                      <span className="font-semibold text-red-600">-${employee.taxes.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b">
                                      <span className="text-gray-600">Insurance</span>
                                      <span className="font-semibold text-red-600">-${employee.insurance.toLocaleString()}</span>
                                    </div>
                                    {employee.penalties > 0 && (
                                      <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-gray-600">Penalties</span>
                                        <span className="font-semibold text-red-600">-${employee.penalties.toLocaleString()}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2">
                                      <span className="font-bold text-lg">Net Salary</span>
                                      <span className="font-bold text-green-600 text-xl">${employee.netSalary.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Attendance & Exceptions */}
                                <div className="space-y-4">
                                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                      <Activity size={18} />
                                      Attendance Summary
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Working Days</p>
                                        <p className="text-2xl font-bold text-gray-900">{employee.workingDays}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Absent Days</p>
                                        <p className="text-2xl font-bold text-orange-600">{employee.absentDays}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Overtime Hrs</p>
                                        <p className="text-2xl font-bold text-blue-600">{employee.overtimeHours}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quick Adjustments */}
                                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                      <Edit3 size={18} />
                                      Quick Adjustments
                                    </h4>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => openAdjustmentModal(employee, 'bonus')}
                                        className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold text-sm flex items-center justify-center gap-2"
                                      >
                                        <Plus size={16} />
                                        Add Bonus
                                      </button>
                                      <button
                                        onClick={() => openAdjustmentModal(employee, 'deduction')}
                                        className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold text-sm flex items-center justify-center gap-2"
                                      >
                                        <Minus size={16} />
                                        Add Deduction
                                      </button>
                                      <button
                                        onClick={() => openAdjustmentModal(employee, 'benefit')}
                                        className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-semibold text-sm flex items-center justify-center gap-2"
                                      >
                                        <Gift size={16} />
                                        Add Benefit
                                      </button>
                                    </div>
                                  </div>

                                  {/* Exceptions */}
                                  {employee.exceptions && (
                                    <div className="bg-orange-50 rounded-lg p-5 border-2 border-orange-300">
                                      <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                                        <AlertTriangle size={18} />
                                        Exception Details
                                      </h4>
                                      {employee.exceptions.map((exception, idx) => (
                                        <div key={idx} className="mb-4 last:mb-0">
                                          <div className="flex items-start gap-3 mb-3">
                                            <AlertCircle className="text-orange-600 mt-1 flex-shrink-0" size={20} />
                                            <div className="flex-1">
                                              <p className="font-semibold text-orange-900 mb-1">
                                                {getExceptionTypeLabel(exception.type)}
                                              </p>
                                              <p className="text-sm text-orange-700 mb-2">{exception.message}</p>
                                              <p className="text-xs text-orange-600 flex items-center gap-1">
                                                <Clock size={12} />
                                                Flagged: {new Date(exception.flaggedAt).toLocaleString()}
                                              </p>
                                            </div>
                                          </div>
                                          
                                          {selectedEmployee === employee.id ? (
                                            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Resolution Note
                                              </label>
                                              <textarea
                                                value={resolutionNote}
                                                onChange={(e) => setResolutionNote(e.target.value)}
                                                placeholder="Explain how this exception was resolved..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                                                rows={3}
                                              />
                                              <div className="flex gap-2">
                                                <button
                                                  onClick={() => handleResolveException(employee.id)}
                                                  disabled={resolving}
                                                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                                                >
                                                  <CheckSquare size={16} />
                                                  {resolving ? 'Resolving...' : 'Mark Resolved'}
                                                </button>
                                                <button
                                                  onClick={() => { setSelectedEmployee(null); setResolutionNote(''); }}
                                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => setSelectedEmployee(employee.id)}
                                              className="mt-2 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
                                            >
                                              Resolve Exception
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pre-Run Items Tab Content */}
          {activeTab === 'prerun' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Amount</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {preRunItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <CheckCircle size={48} className="mx-auto text-green-400 mb-3" />
                        <p className="font-medium">No pre-run items</p>
                        <p className="text-sm">All signing bonuses and benefits have been processed.</p>
                      </td>
                    </tr>
                  ) : (
                    preRunItems.map((item) => (
                      <tr key={item._id} className={`hover:bg-gray-50 ${item.status === 'PENDING' ? 'bg-yellow-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <User size={20} className="text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {item.employeeId?.firstName} {item.employeeId?.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-200 text-purple-800">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            item.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                            item.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
                            'bg-red-200 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          ${(item.givenAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {item.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => openEditPreRunModal(item)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Edit Amount"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button
                                  onClick={() => handleApprovePreRunItem(item)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => handleRejectPreRunItem(item)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  title="Reject"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            {item.status !== 'PENDING' && (
                              <span className="text-gray-400 text-sm">No actions</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {adjustmentData.type === 'bonus' && <Plus className="text-green-600" size={24} />}
              {adjustmentData.type === 'deduction' && <Minus className="text-red-600" size={24} />}
              {adjustmentData.type === 'benefit' && <Gift className="text-purple-600" size={24} />}
              Add {adjustmentData.type.charAt(0).toUpperCase() + adjustmentData.type.slice(1)}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              For: <span className="font-semibold">{adjustmentData.employeeName}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={adjustmentData.amount}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount..."
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
                <textarea
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter reason for this adjustment..."
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateAdjustment}
                disabled={adjusting}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  adjustmentData.type === 'bonus' ? 'bg-green-600 hover:bg-green-700' :
                  adjustmentData.type === 'deduction' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-purple-600 hover:bg-purple-700'
                } disabled:opacity-50`}
              >
                {adjusting ? 'Creating...' : 'Create Adjustment'}
              </button>
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pre-Run Item Modal */}
      {showEditPreRunModal && editingPreRunItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Edit3 className="text-blue-600" size={24} />
              Edit {editingPreRunItem.type}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              For: <span className="font-semibold">
                {editingPreRunItem.employeeId?.firstName} {editingPreRunItem.employeeId?.lastName}
              </span>
            </p>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (USD)</label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount..."
                min="0"
              />
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleEditPreRunItem}
                disabled={editingPreRun}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
              >
                {editingPreRun ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setShowEditPreRunModal(false); setEditingPreRunItem(null); }}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollDraftPage;