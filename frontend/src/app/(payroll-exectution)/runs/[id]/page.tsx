"use client"
import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Send,
  Download,
  Eye,
  Check,
  X,
  ArrowLeft,
  Lock,
  Unlock,
  Clock,
  XCircle
} from 'lucide-react';

const API_URL = "http://localhost:3000";
// [
//   {
//     _id: ObjectId('6940380702779cf63544e8fe'),
//     employeeNumber: 'EMP-0001',
//     fullName: 'Mohamed Shaker',
//     systemRole: 'Payroll Manager'
//   },
//   {
//     _id: ObjectId('6940380702779cf63544e8ff'),
//     employeeNumber: 'EMP-0002',
//     fullName: 'Fatima Khalil',
//     systemRole: 'Finance Staff'
//   },
//   {
//     _id: ObjectId('6940380702779cf63544e900'),
//     employeeNumber: 'EMP-0003',
//     fullName: 'Hossam Youssef',
//     systemRole: 'Payroll Specialist'
//   }
// ]
const RoleSwitcher = ({ currentRole, onRoleChange }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border-2 border-blue-500 z-50">
      <p className="text-xs font-semibold text-gray-700 mb-2">🧪 Test Role</p>
      <select 
        value={currentRole} 
        onChange={(e) => onRoleChange(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm"
      >
        <option value="PAYROLL_SPECIALIST">Payroll Specialist</option>
        <option value="PAYROLL_MANAGER">Payroll Manager</option>
        <option value="FINANCE_STAFF">Finance Staff</option>
      </select>
    </div>
  );
};

const RunDetailsPage = () => {
  const [role, setRole] = useState('PAYROLL_SPECIALIST');
  const [runId] = useState('69404a00e76572e0511db320'); 
  const [run, setRun] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [preRunItems, setPreRunItems] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('payroll');
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showUnfreezeModal, setShowUnfreezeModal] = useState(false);
  const [unfreezeReason, setUnfreezeReason] = useState('');

  const user = { id: '123', name: 'John Doe' };

  useEffect(() => {
    if (runId) {
      fetchRunDetails();
      fetchApprovalHistory();
    }
  }, [runId]);

  const fetchRunDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Correct endpoint: GET /payroll-execution/payroll-runs/:id
      const runResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs/${runId}`);
      if (!runResponse.ok) throw new Error('Failed to fetch payroll run');
      
      const runData = await runResponse.json();
      setRun(runData);
      
      // Correct endpoint: GET /payroll-execution/payroll-runs/:runId/review/draft
      const draftResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs/${runId}/review/draft`);
      if (draftResponse.ok) {
        const draftData = await draftResponse.json();
        if (draftData.employees && Array.isArray(draftData.employees)) {
          setEmployees(draftData.employees);
        }
      }

      // Correct endpoints for pre-run items
      const [bonusesRes, benefitsRes] = await Promise.all([
        fetch(`${API_URL}/payroll-execution/signing-bonuses/pending`),
        fetch(`${API_URL}/payroll-execution/benefits/pending`)
      ]);

      let allPreRunItems = [];
      
      if (bonusesRes.ok) {
        const bonuses = await bonusesRes.json();
        allPreRunItems = [...allPreRunItems, ...bonuses.map((b) => ({
          ...b,
          type: 'Signing Bonus'
        }))];
      }
      
      if (benefitsRes.ok) {
        const benefits = await benefitsRes.json();
        allPreRunItems = [...allPreRunItems, ...benefits.map((b) => ({
          ...b,
          type: b.benefitType || 'Benefit'
        }))];
      }

      setPreRunItems(allPreRunItems);
      
    } catch (error) {
      setError(error.message || 'Failed to load run details');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      // Correct endpoint: GET /payroll-execution/payroll-runs/:runId/approvals
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${runId}/approvals`);
      if (response.ok) {
        const data = await response.json();
        setApprovalHistory(Array.isArray(data) ? data : []);
      } else {
        setApprovalHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch approval history:', error);
      setApprovalHistory([]);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Send this payroll for manager approval?')) return;
    
    try {
      // Correct endpoint: PATCH /payroll-execution/payroll-runs/:runId/publish
      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/publish`,
        { method: 'PATCH' }
      );
      
      if (!response.ok) throw new Error('Failed to publish');
      
      alert('Payroll sent to Manager for review!');
      fetchRunDetails();
      fetchApprovalHistory();
    } catch (error) {
      alert(error.message || 'Failed to publish payroll');
    }
  };

  const handleManagerApprove = async () => {
    if (!confirm('Approve this payroll? It will be sent to Finance for final review.')) return;
    
    try {
      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/manager-approve`,
        { 
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approverId: "6940380702779cf63544e8fe" })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to approve';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        console.error('Server response:', errorText);
        throw new Error(errorMessage);
      }
      
      alert('Approved! Sent to Finance for final approval.');
      fetchRunDetails();
      fetchApprovalHistory();
    } catch (error) {
      console.error('Approve error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleManagerReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      // Correct endpoint: PATCH /payroll-execution/payroll-runs/:runId/manager-reject
      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/manager-reject`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            reason: rejectionReason,
            approverId: user.id 
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject');
      }
      
      alert('Rejected and sent back to Payroll Specialist');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchRunDetails();
      fetchApprovalHistory();
    } catch (error) {
      console.error('Reject error:', error);
      alert(error.message || 'Failed to reject');
    }
  };

  const handleFinanceApprove = async () => {
    if (!confirm('Approve this payroll for finalization?')) return;
    
    try {
      // Correct endpoint: PATCH /payroll-execution/payroll-runs/:runId/finance-approve
      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/finance-approve`,
        { 
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approverId: "6940380702779cf63544e8ff" })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve');
      }
      
      alert('Approved! Payroll Manager can now freeze it.');
      fetchRunDetails();
      fetchApprovalHistory();
    } catch (error) {
      console.error('Finance approve error:', error);
      alert(error.message || 'Failed to approve');
    }
  };

  const handleFinanceReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      // Correct endpoint: PATCH /payroll-execution/payroll-runs/:runId/finance-reject
      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/finance-reject`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            reason: rejectionReason,
            approverId: user.id 
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject');
      }
      
      alert('Rejected and sent back to Payroll Specialist');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchRunDetails();
      fetchApprovalHistory();
    } catch (error) {
      console.error('Finance reject error:', error);
      alert(error.message || 'Failed to reject');
    }
  };

  const handleFreeze = async () => {
    if (!confirm('Freeze this payroll? No further changes will be allowed.')) return;
    
    try {
      // Correct endpoint: PATCH /payroll-execution/payroll-runs/:runId/freeze
      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/freeze`,
        { 
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Payroll finalized' })
        }
      );
      
      if (!response.ok) throw new Error('Failed to freeze');
      
      alert('Payroll frozen! Status: PAID');
      fetchRunDetails();
      fetchApprovalHistory();
    } catch (error) {
      alert(error.message || 'Failed to freeze payroll');
    }
  };

  const handleUnfreeze = async () => {
    if (!unfreezeReason.trim()) {
      alert('Please provide a reason for unfreezing');
      return;
    }
    
    try {
      // Correct endpoint: PATCH /payroll-execution/payroll-runs/:runId/unfreeze
      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/unfreeze`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unlockReason: unfreezeReason })
        }
      );
      
      if (!response.ok) throw new Error('Failed to unfreeze');
      
      alert('Payroll unfrozen');
      setShowUnfreezeModal(false);
      setUnfreezeReason('');
      fetchRunDetails();
      fetchApprovalHistory();
    } catch (error) {
      alert(error.message || 'Failed to unfreeze payroll');
    }
  };

  const handleApprovePreRunItem = async (itemId, itemType) => {
    try {
      const endpoint = itemType === 'Signing Bonus' 
        ? `${API_URL}/payroll-execution/signing-bonuses/${itemId}/approve`
        : `${API_URL}/payroll-execution/benefits/${itemId}/approve`;
      
      const response = await fetch(endpoint, { method: 'PATCH' });
      
      if (!response.ok) throw new Error('Failed to approve item');
      
      alert('Item approved successfully!');
      fetchRunDetails();
    } catch (error) {
      alert(error.message || 'Failed to approve item');
    }
  };

  const handleRejectPreRunItem = async (itemId, itemType) => {
    try {
      const endpoint = itemType === 'Signing Bonus' 
        ? `${API_URL}/payroll-execution/signing-bonuses/${itemId}/reject`
        : `${API_URL}/payroll-execution/benefits/${itemId}/reject`;
      
      const response = await fetch(endpoint, { method: 'PATCH' });
      
      if (!response.ok) throw new Error('Failed to reject item');
      
      alert('Item rejected successfully!');
      fetchRunDetails();
    } catch (error) {
      alert(error.message || 'Failed to reject item');
    }
  };

  const ActionButtons = () => {
    if (!run) return null;

    const normalizedStatus = run.status.toUpperCase().replace(/\s+/g, '_');

    if (role === 'PAYROLL_SPECIALIST' && normalizedStatus === 'DRAFT') {
      return (
        <button
          onClick={handlePublish}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Send size={16} />
          Send for Manager Approval
        </button>
      );
    }

    if (role === 'PAYROLL_MANAGER' && normalizedStatus === 'UNDER_REVIEW') {
      return (
        <div className="flex gap-2">
          <button
            onClick={handleManagerApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle size={16} />
            Approve
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>
      );
    }

    if (role === 'FINANCE_STAFF' && normalizedStatus === 'PENDING_FINANCE_APPROVAL') {
      return (
        <div className="flex gap-2">
          <button
            onClick={handleFinanceApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle size={16} />
            Approve
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>
      );
    }

    if (role === 'PAYROLL_MANAGER' && normalizedStatus === 'APPROVED') {
      return (
        <button
          onClick={handleFreeze}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Lock size={16} />
          Freeze & Finalize
        </button>
      );
    }

    if (role === 'PAYROLL_MANAGER' && normalizedStatus === 'PAID') {
      return (
        <button
          onClick={() => setShowUnfreezeModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <Unlock size={16} />
          Unfreeze
        </button>
      );
    }

    return null;
  };

  const getBankStatus = (employee) => {
    if (!employee.employeeId?.bankAccountDetails) return 'missing';
    const bank = employee.employeeId.bankAccountDetails;
    if (!bank.accountNumber || !bank.bankName) return 'invalid';
    return 'valid';
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
    const colors = {
      'DRAFT': 'bg-gray-200 text-gray-800',
      'UNDER_REVIEW': 'bg-yellow-200 text-yellow-800',
      'WAITING_FINANCE_APPROVAL': 'bg-blue-200 text-blue-800',
      'APPROVED': 'bg-green-200 text-green-800',
      'PAID': 'bg-purple-200 text-purple-800',
      'REJECTED': 'bg-red-200 text-red-800'
    };
    return colors[normalizedStatus] || 'bg-gray-200 text-gray-800';
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

  const totalGross = employees.reduce((sum, emp) => 
    sum + (emp.baseSalary + emp.allowances + (emp.bonus || 0) + (emp.benefit || 0)), 0
  );
  const totalDeductions = employees.reduce((sum, emp) => sum + emp.deductions, 0);
  const totalNet = employees.reduce((sum, emp) => sum + emp.netPay, 0);

  const normalizedStatus = run.status.toUpperCase().replace(/\s+/g, '_');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <RoleSwitcher currentRole={role} onRoleChange={setRole} />
      
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                Current Role: {role.replace(/_/g, ' ')}
              </span>
            </div>
            <span className="text-xs text-blue-700">
              Status: {run.status} | 
              {role === 'PAYROLL_SPECIALIST' && normalizedStatus === 'DRAFT' && ' ✅ Can publish'}
              {role === 'PAYROLL_MANAGER' && normalizedStatus === 'UNDER_REVIEW' && ' ✅ Can approve/reject'}
              {role === 'FINANCE_STAFF' && normalizedStatus === 'PENDING_FINANCE_APPROVAL' && ' ✅ Can approve/reject'}
              {role === 'PAYROLL_MANAGER' && normalizedStatus === 'APPROVED' && ' ✅ Can freeze'}
              {role === 'PAYROLL_MANAGER' && normalizedStatus === 'PAID' && ' ✅ Can unfreeze'}
              {!(
                (role === 'PAYROLL_SPECIALIST' && normalizedStatus === 'DRAFT') ||
                (role === 'PAYROLL_MANAGER' && normalizedStatus === 'UNDER_REVIEW') ||
                (role === 'FINANCE_STAFF' && normalizedStatus === 'PENDING_FINANCE_APPROVAL') ||
                (role === 'PAYROLL_MANAGER' && normalizedStatus === 'APPROVED') ||
                (role === 'PAYROLL_MANAGER' && normalizedStatus === 'PAID')
              ) && ' ⚠️ No actions available'}
            </span>
          </div>
        </div>

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
                Payroll Preview - {new Date(run.payrollPeriod).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-gray-600">{run.entity}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(run.status)}`}>
                  {run.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <ActionButtons />
            </div>
          </div>
        </div>

        {normalizedStatus === 'UNDER_REVIEW' && role === 'PAYROLL_MANAGER' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold text-yellow-900">⚠️ Manager Action Required</p>
            <p className="text-sm text-yellow-700">
              This payroll is waiting for your approval.
            </p>
          </div>
        )}

        {normalizedStatus === 'PENDING_FINANCE_APPROVAL' && role === 'FINANCE_STAFF' && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="font-semibold text-blue-900">💼 Finance Action Required</p>
            <p className="text-sm text-blue-700">
              This payroll has been approved by the Manager.
            </p>
          </div>
        )}

        {normalizedStatus === 'APPROVED' && role === 'PAYROLL_MANAGER' && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="font-semibold text-green-900">✅ Ready to Freeze</p>
            <p className="text-sm text-green-700">
              Finance has approved this payroll.
            </p>
          </div>
        )}

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
                Employee Payroll ({employees.length})
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
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-medium text-sm transition ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Approval History ({approvalHistory.length})
              </button>
            </div>
          </div>

          {activeTab === 'payroll' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flags</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No employee data available</p>
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

          {activeTab === 'preruns' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preRunItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No pre-run items</p>
                      </td>
                    </tr>
                  ) : (
                    preRunItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {item.employeeId?.firstName} {item.employeeId?.lastName}
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
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          USD {(item.givenAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View">
                              <Eye size={16} />
                            </button>
                            {item.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleApprovePreRunItem(item._id, item.type)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded" 
                                  title="Approve"
                                >
                                  <Check size={16} />
                                </button>
                                <button 
                                  onClick={() => handleRejectPreRunItem(item._id, item.type)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded" 
                                  title="Reject"
                                >
                                  <X size={16} />
                                </button>
                              </>
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

          {activeTab === 'history' && (
            <div className="p-6">
              {!Array.isArray(approvalHistory) || approvalHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium">No approval history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvalHistory.map((item, index) => (
                    <div key={item._id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.action.includes('approve') ? 'bg-green-100' :
                          item.action.includes('reject') ? 'bg-red-100' :
                          'bg-blue-100'
                        }`}>
                          {item.action.includes('approve') ? <CheckCircle size={20} className="text-green-600" /> :
                           item.action.includes('reject') ? <XCircle size={20} className="text-red-600" /> :
                           <Clock size={20} className="text-blue-600" />}
                        </div>
                        {index < approvalHistory.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className="font-semibold text-gray-900">{item.action}</p>
                        <p className="text-sm text-gray-600">{item.performedBy}</p>
                        <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                        {item.reason && (
                          <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">{item.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Reject Payroll Run</h2>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this payroll run:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                rows={4}
                placeholder="Enter rejection reason..."
              />
              <div className="flex gap-2">
                <button
                  onClick={role === 'PAYROLL_MANAGER' ? handleManagerReject : handleFinanceReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showUnfreezeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Unfreeze Payroll Run</h2>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for unfreezing this payroll:
              </p>
              <textarea
                value={unfreezeReason}
                onChange={(e) => setUnfreezeReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                rows={4}
                placeholder="Enter reason for unfreezing..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUnfreeze}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Confirm Unfreeze
                </button>
                <button
                  onClick={() => {
                    setShowUnfreezeModal(false);
                    setUnfreezeReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunDetailsPage;