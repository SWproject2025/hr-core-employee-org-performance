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
  CheckSquare
} from 'lucide-react';
import { useParams } from 'next/navigation';

const PayrollDraftPage = () => {
  const { id } = useParams();
  const runId = id;
  const [payrollRun, setPayrollRun] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterException, setFilterException] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  
  const API_URL = "http://localhost:3000";

  useEffect(() => {
    fetchPayrollDraft();
  }, []);

  const fetchPayrollDraft = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!runId) {
        setError('No run ID provided in URL');
        setLoading(false);
        return;
      }

      // Get detailed payroll run data for draft review using runId from URL
      const response = await axios.get(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/review/draft`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const runData = response.data;
      
      // Transform the data to match our component structure
      const transformedData = {
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
          totalGross: runData.employees.reduce((sum, emp) => {
            const baseSalary = emp.baseSalary || 0;
            const allowances = emp.allowances || 0;
            const bonus = emp.bonus || 0;
            const benefit = emp.benefit || 0;
            return sum + baseSalary + allowances + bonus + benefit;
          }, 0),
          totalNet: runData.summary.totalNetPay,
          totalDeductions: runData.employees.reduce((sum, emp) => 
            sum + (emp.deductions || 0), 0
          )
        },
        employees: transformEmployees(runData.employees)
      };
      
      setPayrollRun(transformedData);
      setEmployees(transformedData.employees);
    } catch (error) {
      console.error('Failed to fetch payroll draft:', error);
      setError(error.response?.data?.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const transformEmployees = (employeesData) => {
    return employeesData.map(emp => {
      const employeeInfo = emp.employeeId || {};
      const baseSalary = emp.baseSalary || 0;
      const allowances = emp.allowances || 0;
      const bonus = emp.bonus || 0;
      const benefit = emp.benefit || 0;
      const grossSalary = baseSalary + allowances + bonus + benefit;
      const deductions = emp.deductions || 0;
      const netSalary = emp.netPay || 0;
      
      // Parse exceptions from string format
      let exceptions = null;
      if (emp.exceptions && typeof emp.exceptions === 'string') {
        // Check if it's a resolved exception (contains "RESOLVED:")
        if (!emp.exceptions.includes('RESOLVED:')) {
          exceptions = [{
            type: 'GENERAL_EXCEPTION',
            severity: 'MEDIUM',
            message: emp.exceptions,
            flaggedAt: new Date().toISOString()
          }];
        }
      }

      return {
        id: emp.employeeId?._id || emp._id,
        name: employeeInfo.firstName && employeeInfo.lastName 
          ? `${employeeInfo.firstName} ${employeeInfo.lastName}` 
          : 'Unknown Employee',
        department: employeeInfo.department || 'N/A',
        position: employeeInfo.jobTitle || 'N/A',
        baseSalary: baseSalary,
        allowances: allowances + bonus + benefit,
        grossSalary: grossSalary,
        taxes: Math.floor(deductions * 0.5), // Estimated breakdown
        insurance: Math.floor(deductions * 0.3),
        penalties: Math.floor(deductions * 0.2),
        netSalary: netSalary,
        workingDays: emp.workingDays || 22,
        absentDays: emp.absentDays || 0,
        overtimeHours: emp.overtimeHours || 0,
        exceptions: exceptions
      };
    });
  };

  const handleResolveException = async (employeeId) => {
    if (!resolutionNote.trim()) {
      alert('Please provide a resolution note');
      return;
    }
    
    try {
      setResolving(true);
      
      await axios.patch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions/${employeeId}/resolve`,
        { resolutionNote },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, exceptions: null }
          : emp
      ));
      
      // Recalculate statistics
      if (payrollRun) {
        const updatedEmployees = employees.map(emp => 
          emp.id === employeeId ? { ...emp, exceptions: null } : emp
        );
        setPayrollRun(prev => ({
          ...prev,
          statistics: {
            ...prev.statistics,
            withExceptions: updatedEmployees.filter(e => e.exceptions).length
          }
        }));
      }
      
      setSelectedEmployee(null);
      setResolutionNote('');
      alert('Exception resolved successfully!');
    } catch (error) {
      console.error('Failed to resolve exception:', error);
      alert(error.response?.data?.message || 'Failed to resolve exception');
    } finally {
      setResolving(false);
    }
  };

  const handlePublishForApproval = async () => {
    const exceptionsCount = employees.filter(e => e.exceptions).length;
    
    if (exceptionsCount > 0) {
      if (!window.confirm(`There are ${exceptionsCount} unresolved exceptions. Do you want to continue publishing for approval?`)) {
        return;
      }
    }
    
    try {
      setPublishing(true);
      
      await axios.patch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/publish`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      alert('Payroll successfully published for manager and finance approval!');
      
      // Refresh the data
      await fetchPayrollDraft();
    } catch (error) {
      console.error('Failed to publish payroll:', error);
      alert(error.response?.data?.message || 'Failed to publish payroll for approval');
    } finally {
      setPublishing(false);
    }
  };

  const toggleRowExpansion = (employeeId) => {
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

  const getExceptionBadge = (exceptions) => {
    if (!exceptions || exceptions.length === 0) return null;
    const severity = exceptions[0].severity;
    const colors = {
      HIGH: 'bg-red-100 text-red-800 border-red-300',
      MEDIUM: 'bg-orange-100 text-orange-800 border-orange-300',
      LOW: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${colors[severity]}`}>
        <AlertTriangle size={12} />
        {exceptions.length} Exception{exceptions.length > 1 ? 's' : ''}
      </span>
    );
  };

  const getExceptionTypeLabel = (type) => {
    const labels = {
      MISSING_BANK_ACCOUNT: 'Missing Bank Account',
      NEGATIVE_NET_PAY: 'Negative Net Pay',
      SALARY_SPIKE: 'Unusual Salary Spike',
      MISSING_TAX_INFO: 'Missing Tax Information',
      UNPAID_LEAVE_ISSUE: 'Unpaid Leave Issue',
      CONTRACT_EXPIRED: 'Contract Expired',
      INACTIVE_EMPLOYEE: 'Inactive Employee',
      MISSING_ATTENDANCE: 'Missing Attendance Data',
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto transition-colors"
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
                <h1 className="text-3xl font-bold text-gray-900">
                  Payroll Draft Review
                </h1>
              </div>
              <p className="text-gray-600 ml-11">
                {payrollRun.period.month} {payrollRun.period.year} • Run ID: {payrollRun.runId}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchPayrollDraft}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-200">
                STATUS: {payrollRun.status}
              </span>
              <button
                onClick={handlePublishForApproval}
                disabled={publishing}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md transition-all"
              >
                <Send size={20} />
                {publishing ? 'Publishing...' : 'Send for Approval'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Users size={24} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Employees</span>
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
              <TrendingUp size={24} className="text-green-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Gross</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${payrollRun.statistics.totalGross.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <DollarSign size={24} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Net</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${payrollRun.statistics.totalNet.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Exception Alert */}
        {exceptionsCount > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-5 mb-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 text-lg mb-1">
                  {exceptionsCount} Exception{exceptionsCount !== 1 ? 's' : ''} Require{exceptionsCount === 1 ? 's' : ''} Attention
                </h3>
                <p className="text-sm text-orange-700">
                  Review and resolve exceptions before publishing for approval. Click on any employee row to view details.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Employee
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exception Filter
              </label>
              <select
                value={filterException}
                onChange={(e) => setFilterException(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Employees</option>
                <option value="with">With Exceptions</option>
                <option value="without">Without Exceptions</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Gross Salary
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <React.Fragment key={employee.id}>
                    <tr 
                      className={`hover:bg-gray-50 transition-colors ${
                        employee.exceptions ? 'bg-orange-50' : ''
                      }`}
                    >
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
                      <td className="px-4 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          ${employee.grossSalary.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-red-600 font-semibold">
                          -${(employee.taxes + employee.insurance + employee.penalties).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-green-600 text-lg">
                          ${employee.netSalary.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getExceptionBadge(employee.exceptions) || (
                          <CheckCircle size={20} className="text-green-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleRowExpansion(employee.id)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1 mx-auto transition-colors"
                        >
                          {expandedRows.has(employee.id) ? (
                            <>
                              <ChevronUp size={16} />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              Details
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    
                    {expandedRows.has(employee.id) && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="px-4 py-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Salary Breakdown */}
                            <div className="bg-white rounded-lg p-5 border border-gray-200">
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard size={18} />
                                Salary Breakdown
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                  <span className="text-gray-600">Base Salary</span>
                                  <span className="font-semibold text-gray-900">
                                    ${employee.baseSalary.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                  <span className="text-gray-600">Allowances</span>
                                  <span className="font-semibold text-green-600">
                                    +${employee.allowances.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                  <span className="font-semibold text-gray-700">Gross Salary</span>
                                  <span className="font-bold text-gray-900">
                                    ${employee.grossSalary.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                  <span className="text-gray-600">Taxes</span>
                                  <span className="font-semibold text-red-600">
                                    -${employee.taxes.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                  <span className="text-gray-600">Insurance</span>
                                  <span className="font-semibold text-red-600">
                                    -${employee.insurance.toLocaleString()}
                                  </span>
                                </div>
                                {employee.penalties > 0 && (
                                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                    <span className="text-gray-600">Penalties</span>
                                    <span className="font-semibold text-red-600">
                                      -${employee.penalties.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center pt-2">
                                  <span className="font-bold text-gray-900 text-lg">Net Salary</span>
                                  <span className="font-bold text-green-600 text-xl">
                                    ${employee.netSalary.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Attendance & Exceptions */}
                            <div className="space-y-4">
                              {/* Attendance Info */}
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
                                          <p className="text-sm text-orange-700 mb-2">
                                            {exception.message}
                                          </p>
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                                            rows="3"
                                          />
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => handleResolveException(employee.id)}
                                              disabled={resolving}
                                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2 transition-colors"
                                            >
                                              <CheckSquare size={16} />
                                              {resolving ? 'Resolving...' : 'Mark Resolved'}
                                            </button>
                                            <button
                                              onClick={() => {
                                                setSelectedEmployee(null);
                                                setResolutionNote('');
                                              }}
                                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setSelectedEmployee(employee.id)}
                                          className="mt-2 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
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
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">No employees match your filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterException('all');
                  setFilterDepartment('all');
                }}
                className="mt-3 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollDraftPage;