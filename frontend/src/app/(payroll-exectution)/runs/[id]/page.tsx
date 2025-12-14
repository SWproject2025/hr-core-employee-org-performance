"use client"
import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Send,
  Play,
  Download,
  Eye,
  Edit,
  Check,
  X,
  ArrowLeft
} from 'lucide-react';

const API_URL = "http://localhost:3000";

interface PayrollRun {
  _id: string;
  runId: string;
  status: string;
  payrollPeriod: string;
  entity: string;
  employees: number;
  exceptions: number;
  totalGrossPay?: number;
  totalDeductions?: number;
  totalnetpay: number;
  rejectionReason?: string;
}

interface EmployeeDetail {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    code: string;
    department: string;
    bankAccountDetails?: any;
  };
  baseSalary: number;
  allowances: number;
  bonus?: number;
  benefit?: number;
  deductions: number;
  netPay: number;
  exceptions?: string;
}

interface PreRunItem {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    code: string;
  };
  type: string;
  status: string;
  givenAmount: number;
  paymentDate?: string;
  effectiveDate?: string;
}

const RunDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [runId, setRunId] = useState<string>('');
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
  const [preRunItems, setPreRunItems] = useState<PreRunItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'payroll' | 'preruns'>('payroll');

  // Initialize runId from params
  useEffect(() => {
    const initPage = async () => {
      const resolvedParams = await params;
      setRunId(resolvedParams.id);
    };
    initPage();
  }, [params]);

  // Fetch data when runId is available
  useEffect(() => {
    if (runId) {
      fetchRunDetails();
    }
  }, [runId]);

  const fetchRunDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching run details for:', runId);
      
      // Fetch run details
      const runResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs/${runId}`);
      
      if (!runResponse.ok) {
        throw new Error('Failed to fetch payroll run');
      }
      
      const runData = await runResponse.json();
      console.log('✅ Run data:', runData);
      setRun(runData);
      
      // Fetch draft review data (employee details with populated data)
      const draftResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs/${runId}/review/draft`);
      
      if (draftResponse.ok) {
        const draftData = await draftResponse.json();
        console.log('📊 Draft data:', draftData);
        
        if (draftData.employees && Array.isArray(draftData.employees)) {
          console.log('👥 Number of employees:', draftData.employees.length);
          console.log('📝 Sample employee:', draftData.employees[0]);
          setEmployees(draftData.employees);
        }
      } else {
        console.error('❌ Failed to fetch draft data:', draftResponse.status);
      }

      // Fetch pre-run items (signing bonuses and benefits)
      const [bonusesRes, benefitsRes] = await Promise.all([
        fetch(`${API_URL}/payroll-execution/signing-bonuses/pending`),
        fetch(`${API_URL}/payroll-execution/benefits/pending`)
      ]);

      let allPreRunItems: PreRunItem[] = [];
      
      if (bonusesRes.ok) {
        const bonuses = await bonusesRes.json();
        allPreRunItems = [...allPreRunItems, ...bonuses.map((b: any) => ({
          ...b,
          type: 'Signing Bonus'
        }))];
      }
      
      if (benefitsRes.ok) {
        const benefits = await benefitsRes.json();
        allPreRunItems = [...allPreRunItems, ...benefits.map((b: any) => ({
          ...b,
          type: b.benefitType || 'Benefit'
        }))];
      }

      console.log('📋 Pre-run items:', allPreRunItems.length);
      setPreRunItems(allPreRunItems);
      
    } catch (error: any) {
      console.error('❌ Error fetching run details:', error);
      setError(error.message || 'Failed to load run details');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Send this payroll for approval?')) return;
    
    try {
      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/publish`,
        { method: 'PATCH' }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to publish');
      }
      
      alert('Payroll sent for approval successfully!');
      fetchRunDetails();
    } catch (error: any) {
      alert(error.message || 'Failed to publish payroll');
    }
  };

  const getBankStatus = (employee: EmployeeDetail): 'valid' | 'missing' | 'invalid' => {
    if (!employee.employeeId?.bankAccountDetails) return 'missing';
    const bank = employee.employeeId.bankAccountDetails;
    if (!bank.accountNumber || !bank.bankName) return 'invalid';
    return 'valid';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-500">{error || 'Payroll run not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to All Runs
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals from employee data
  const totalGross = employees.reduce((sum, emp) => 
    sum + (emp.baseSalary + emp.allowances + (emp.bonus || 0) + (emp.benefit || 0)), 0
  );
  const totalDeductions = employees.reduce((sum, emp) => sum + emp.deductions, 0);
  const totalNet = employees.reduce((sum, emp) => sum + emp.netPay, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 text-sm flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Runs
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Payroll Preview - {new Date(run.payrollPeriod).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' })}
              </h1>
              <p className="text-gray-600 mt-1">
                {run.entity} • Status: <span className="font-semibold">{run.status}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => alert('Running simulation...')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 text-sm"
              >
                <Play size={16} />
                Run Simulation
              </button>
              <button
                onClick={() => alert('Exporting to PDF...')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                PDF
              </button>
              <button
                onClick={() => alert('Exporting to Excel...')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Excel
              </button>
              {run.status === 'DRAFT' && (
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                >
                  <Send size={16} />
                  Send for Approval
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Gross</p>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">USD {totalGross.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Deductions</p>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign size={20} className="text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">USD {totalDeductions.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Net</p>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">USD {totalNet.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Employees</p>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Exceptions</p>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {employees.filter(e => e.exceptions).length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('payroll')}
                className={`px-6 py-3 font-medium text-sm transition ${
                  activeTab === 'payroll'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Employee Payroll Details ({employees.length})
              </button>
              <button
                onClick={() => setActiveTab('preruns')}
                className={`px-6 py-3 font-medium text-sm transition ${
                  activeTab === 'preruns'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pre-Run Items ({preRunItems.length})
              </button>
            </div>
          </div>

          {/* Employee Payroll Details Table */}
          {activeTab === 'payroll' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flags</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No employee data available</p>
                        <p className="text-sm text-gray-400 mt-2">
                          The payroll run may still be processing
                        </p>
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => {
                      const employee = emp.employeeId;
                      const bankStatus = getBankStatus(emp);
                      
                      return (
                        <tr key={emp._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {employee?.firstName} {employee?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee?.department || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            USD {(emp.baseSalary || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            USD {(emp.allowances || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            USD {(emp.deductions || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            USD {(emp.netPay || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              bankStatus === 'valid' ? 'bg-green-200 text-green-800' :
                              bankStatus === 'missing' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {bankStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {emp.exceptions ? (
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs max-w-xs">
                                <AlertTriangle size={12} className="flex-shrink-0" />
                                <span className="truncate">{emp.exceptions}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pre-Run Items Table */}
          {activeTab === 'preruns' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preRunItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No pre-run items</p>
                        <p className="text-sm text-gray-400 mt-2">
                          All signing bonuses and benefits have been processed
                        </p>
                      </td>
                    </tr>
                  ) : (
                    preRunItems.map((item) => {
                      const employee = item.employeeId;
                      
                      return (
                        <tr key={item._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {employee?.firstName} {employee?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{employee?.code}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              item.type === 'Signing Bonus' ? 'bg-purple-200 text-purple-800' :
                              item.type === 'Termination' ? 'bg-red-200 text-red-800' :
                              item.type === 'Resignation' ? 'bg-orange-200 text-orange-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              item.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                              item.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
                              item.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
                              'bg-gray-200 text-gray-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            USD {(item.givenAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.effectiveDate ? new Date(item.effectiveDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" 
                                title="View"
                                onClick={() => alert('View details')}
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="p-1 text-gray-600 hover:bg-gray-50 rounded transition" 
                                title="Edit"
                                onClick={() => alert('Edit item')}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition" 
                                title="Approve"
                                onClick={() => alert('Approve item')}
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition" 
                                title="Reject"
                                onClick={() => alert('Reject item')}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rejection Reason Alert */}
        {run.rejectionReason && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-900">Rejection Reason</p>
                <p className="text-sm text-red-700 mt-1">{run.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RunDetailsPage;