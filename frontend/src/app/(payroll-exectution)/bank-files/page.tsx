"use client"
import React, { useState, useEffect } from 'react';
import { Check, X, Lock, Send, FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import payrollService from '@/lib/payrollService';

const ApprovalsExecutionPage = ({ params }: { params: { id: string } }) => {
  const [payrollRun, setPayrollRun] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'specialist' | 'manager' | 'finance'>('specialist');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'freeze' | 'unfreeze'>('approve');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [runData, approvalsData] = await Promise.all([
        payrollService.getPayrollRunById(params.id),
        payrollService.getApprovalsByRunId(params.id)
      ]);
      setPayrollRun(runData);
      setApprovals(approvalsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await payrollService.publishDraftForApproval(params.id);
      alert('Payroll published for approval');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to publish');
    }
  };

  const handleManagerAction = async (action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await payrollService.managerApprove(params.id);
        alert('Manager approved successfully');
      } else {
        if (!reason.trim()) {
          alert('Please provide a reason for rejection');
          return;
        }
        await payrollService.managerReject(params.id, reason);
        alert('Manager rejected');
      }
      setShowModal(false);
      setReason('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Action failed');
    }
  };

  const handleFinanceAction = async (action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await payrollService.financeApprove(params.id);
        alert('Finance approved successfully');
      } else {
        if (!reason.trim()) {
          alert('Please provide a reason for rejection');
          return;
        }
        await payrollService.financeReject(params.id, reason);
        alert('Finance rejected');
      }
      setShowModal(false);
      setReason('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Action failed');
    }
  };

  const handleFreeze = async () => {
    try {
      await payrollService.freezePayroll(params.id, reason);
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
      await payrollService.unfreezePayroll(params.id, reason);
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
      await payrollService.generatePayslips(params.id);
      alert('Payslips generated successfully');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to generate payslips');
    }
  };

  const handleDistributePayslips = async () => {
    try {
      await payrollService.distributePayslips(params.id);
      alert('Payslips distributed successfully');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to distribute payslips');
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await payrollService.markPayrollAsPaid(params.id);
      alert('Payroll marked as paid');
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

  const getStepStatus = (step: string) => {
    const statusMap: any = {
      'draft': 0,
      'under review': 1,
      'pending finance approval': 2,
      'approved': 3,
      'locked': 4,
      'paid': 5
    };
    return statusMap[payrollRun.status] || 0;
  };

  const currentStep = getStepStatus(payrollRun.status);

  const steps = [
    { label: 'Specialist Review', icon: FileText },
    { label: 'Manager Approval', icon: Check },
    { label: 'Finance Approval', icon: Check },
    { label: 'Frozen', icon: Lock },
    { label: 'Paid', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Approvals & Execution</h1>
          <p className="text-gray-500 mt-1">Run ID: {payrollRun.runId}</p>
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
                    <p className="text-xs mt-2 text-center font-medium">{step.label}</p>
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
            {payrollRun.status === 'under review' && (
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
            {payrollRun.status === 'pending finance approval' && (
              <button
                onClick={() => {
                  setModalType('freeze');
                  setShowModal(true);
                }}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
              >
                Freeze Payroll
              </button>
            )}
            {payrollRun.status !== 'under review' && payrollRun.status !== 'pending finance approval' && (
              <p className="text-sm text-gray-500">No pending manager actions</p>
            )}
          </div>

          {/* Finance Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-purple-600" />
              Finance Staff
            </h3>
            {payrollRun.status === 'pending finance approval' && (
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
            {payrollRun.status !== 'pending finance approval' && (
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

        {/* Approval History Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Approval History</h2>
          {approvals.length === 0 ? (
            <p className="text-gray-500">No approval history yet</p>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval, index) => (
                <div key={index} className="flex items-start gap-4 border-l-2 border-blue-500 pl-4">
                  <div className="flex-shrink-0">
                    <Clock size={20} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{approval.action}</p>
                    <p className="text-sm text-gray-600">By: {approval.user}</p>
                    {approval.comment && (
                      <p className="text-sm text-gray-500 mt-1">{approval.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(approval.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  Reason (required)
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
                  if (payrollRun.status === 'under review') {
                    handleManagerAction(modalType as 'approve' | 'reject');
                  } else if (payrollRun.status === 'pending finance approval') {
                    if (modalType === 'freeze') {
                      handleFreeze();
                    } else {
                      handleFinanceAction(modalType as 'approve' | 'reject');
                    }
                  } else if (modalType === 'unfreeze') {
                    handleUnfreeze();
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  modalType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  modalType === 'freeze' ? 'bg-purple-600 hover:bg-purple-700' :
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