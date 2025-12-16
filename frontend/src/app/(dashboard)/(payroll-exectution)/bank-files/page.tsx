"use client"
import React, { useState, useEffect } from 'react';
import { Check, X, Lock, Send, FileText, Clock, AlertCircle, CheckCircle, Unlock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const ApprovalsExecutionPage = ({ params }: { params: { id: string } }) => {
  const [payrollRun, setPayrollRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'freeze' | 'unfreeze'>('approve');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch payroll run');
      const data = await response.json();
      setPayrollRun(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}/publish`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to publish');
      alert('Payroll published for approval');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to publish');
    }
  };

  const handleManagerApprove = async () => {
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}/manager-approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: 'current-user-id' }) // Replace with actual user ID
      });
      if (!response.ok) throw new Error('Failed to approve');
      alert('Manager approved successfully');
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Action failed');
    }
  };

  const handleManagerReject = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}/manager-reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason,
          approverId: 'current-user-id' // Replace with actual user ID
        })
      });
      if (!response.ok) throw new Error('Failed to reject');
      alert('Manager rejected successfully');
      setShowModal(false);
      setReason('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Action failed');
    }
  };

  const handleFinanceApprove = async () => {
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}/finance-approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: 'current-user-id' }) // Replace with actual user ID
      });
      if (!response.ok) throw new Error('Failed to approve');
      alert('Finance approved successfully');
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Action failed');
    }
  };

  const handleFinanceReject = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}/finance-reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason,
          approverId: 'current-user-id' // Replace with actual user ID
        })
      });
      if (!response.ok) throw new Error('Failed to reject');
      alert('Finance rejected successfully');
      setShowModal(false);
      setReason('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Action failed');
    }
  };

  const handleFreeze = async () => {
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}/freeze`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to freeze');
      alert('Payroll frozen successfully');
      setShowModal(false);
      setReason('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to freeze');
    }
  };

  const handleUnfreeze = async () => {
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}/unfreeze`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unlockReason: reason })
      });
      if (!response.ok) throw new Error('Failed to unfreeze');
      alert('Payroll unfrozen successfully');
      setShowModal(false);
      setReason('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to unfreeze');
    }
  };

  const handleGeneratePayslips = async () => {
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}/payslips/generate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to generate payslips');
      const data = await response.json();
      alert(`Generated ${data.count} payslips successfully`);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to generate payslips');
    }
  };

  const handleDistributePayslips = async () => {
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}/payslips/distribute`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to distribute payslips');
      const data = await response.json();
      alert(`Distributed ${data.modifiedCount} payslips successfully`);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to distribute payslips');
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${params.id}/mark-paid`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to mark as paid');
      const data = await response.json();
      alert(`Marked ${data.modifiedCount} payslips as paid`);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to mark as paid');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  if (!payrollRun) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-500">Payroll run not found</p>
        </div>
      </div>
    );
  }

  const getStepStatus = (status: string) => {
    const statusMap: any = {
      'draft': 0,
      'under_review': 1,
      'pending_finance_approval': 2,
      'approved': 3,
      'locked': 4,
      'unlocked': 3,
      'rejected': -1
    };
    return statusMap[status?.toLowerCase()] || 0;
  };

  const currentStep = getStepStatus(payrollRun.status);

  const steps = [
    { label: 'Draft', icon: FileText, status: 'draft' },
    { label: 'Manager Review', icon: Check, status: 'under_review' },
    { label: 'Finance Review', icon: CheckCircle, status: 'pending_finance_approval' },
    { label: 'Approved', icon: CheckCircle, status: 'approved' },
    { label: 'Locked', icon: Lock, status: 'locked' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Approvals & Execution</h1>
          <p className="text-gray-500 mt-1">Run ID: {payrollRun.runId || payrollRun._id}</p>
          <div className="mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              payrollRun.status === 'approved' ? 'bg-green-200 text-green-800' :
              payrollRun.status === 'rejected' ? 'bg-red-200 text-red-800' :
              payrollRun.status === 'locked' ? 'bg-purple-200 text-purple-800' :
              'bg-yellow-200 text-yellow-800'
            }`}>
              {payrollRun.status?.toUpperCase().replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Approval Chain Stepper */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Approval Progress</h2>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <p className="text-xs mt-2 text-center font-medium max-w-[80px]">{step.label}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-2xl font-bold">{payrollRun.employees || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Exceptions</p>
            <p className="text-2xl font-bold text-orange-600">{payrollRun.exceptions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Total Net Pay</p>
            <p className="text-2xl font-bold text-green-600">${(payrollRun.totalnetpay || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Role-Based Action Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Specialist Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Payroll Specialist
            </h3>
            {payrollRun.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Publish for Approval
              </button>
            )}
            {payrollRun.status !== 'draft' && (
              <p className="text-sm text-gray-500">Draft already published</p>
            )}
          </div>

          {/* Manager Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Check size={20} className="text-green-600" />
              Payroll Manager
            </h3>
            {payrollRun.status === 'under_review' && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setModalType('approve');
                    setShowModal(true);
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setModalType('reject');
                    setShowModal(true);
                  }}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
            )}
            {(payrollRun.status === 'pending_finance_approval' || payrollRun.status === 'approved') && (
              <button
                onClick={() => {
                  setModalType('freeze');
                  setShowModal(true);
                }}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
              >
                <Lock size={18} />
                Freeze Payroll
              </button>
            )}
            {payrollRun.status === 'locked' && (
              <button
                onClick={() => {
                  setModalType('unfreeze');
                  setShowModal(true);
                }}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
              >
                <Unlock size={18} />
                Unfreeze Payroll
              </button>
            )}
            {payrollRun.status !== 'under_review' && 
             payrollRun.status !== 'pending_finance_approval' && 
             payrollRun.status !== 'approved' &&
             payrollRun.status !== 'locked' && (
              <p className="text-sm text-gray-500">No pending manager actions</p>
            )}
          </div>

          {/* Finance Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-purple-600" />
              Finance Staff
            </h3>
            {payrollRun.status === 'pending_finance_approval' && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setModalType('approve');
                    setShowModal(true);
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setModalType('reject');
                    setShowModal(true);
                  }}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
            )}
            {payrollRun.status !== 'pending_finance_approval' && (
              <p className="text-sm text-gray-500">No pending finance actions</p>
            )}
          </div>
        </div>

        {/* Execution Panel */}
        {(payrollRun.status === 'locked' || payrollRun.status === 'approved') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Execution Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleGeneratePayslips}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                Generate Payslips
              </button>
              <button
                onClick={handleDistributePayslips}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Distribute Payslips
              </button>
              <button
                onClick={handleMarkAsPaid}
                className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Mark as Paid
              </button>
            </div>
          </div>
        )}

        {/* Approval Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Approval Details</h2>
          <div className="space-y-3">
            {payrollRun.managerApprovalDate && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Manager Approved</p>
                  <p className="text-sm text-gray-600">
                    {new Date(payrollRun.managerApprovalDate).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {payrollRun.financeApprovalDate && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Finance Approved</p>
                  <p className="text-sm text-gray-600">
                    {new Date(payrollRun.financeApprovalDate).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {payrollRun.rejectionReason && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <X size={20} className="text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Rejection Reason</p>
                  <p className="text-sm text-gray-600">{payrollRun.rejectionReason}</p>
                </div>
              </div>
            )}
            {payrollRun.unlockReason && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Unlock size={20} className="text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Unlock Reason</p>
                  <p className="text-sm text-gray-600">{payrollRun.unlockReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {modalType === 'approve' ? 'Confirm Approval' :
               modalType === 'reject' ? 'Confirm Rejection' :
               modalType === 'freeze' ? 'Freeze Payroll' :
               'Unfreeze Payroll'}
            </h3>
            
            {(modalType === 'reject' || modalType === 'freeze' || modalType === 'unfreeze') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason {modalType === 'reject' ? '(required)' : '(optional)'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter reason..."
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (payrollRun.status === 'under_review') {
                    if (modalType === 'approve') handleManagerApprove();
                    else if (modalType === 'reject') handleManagerReject();
                  } else if (payrollRun.status === 'pending_finance_approval') {
                    if (modalType === 'approve') handleFinanceApprove();
                    else if (modalType === 'reject') handleFinanceReject();
                    else if (modalType === 'freeze') handleFreeze();
                  } else if (modalType === 'freeze') {
                    handleFreeze();
                  } else if (modalType === 'unfreeze') {
                    handleUnfreeze();
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  modalType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  modalType === 'freeze' ? 'bg-purple-600 hover:bg-purple-700' :
                  modalType === 'unfreeze' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsExecutionPage;