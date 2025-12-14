"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Plus, Eye, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface LeaveType {
  _id: string;
  code: string;
  name: string;
  description?: string;
  paid: boolean;
  requiresAttachment: boolean;
}

interface LeaveBalance {
  leaveType: LeaveType;
  yearlyEntitlement: number;
  accruedRounded: number;
  carryForward: number;
  taken: number;
  pending: number;
  remaining: number;
}

interface LeaveRequest {
  _id: string;
  leaveTypeId: LeaveType;
  dates: { from: Date; to: Date };
  durationDays: number;
  justification: string;
  status: string;
  approvalFlow: Array<{
    role: string;
    status: string;
    decidedBy?: string;
    decidedAt?: Date;
  }>;
  createdAt: Date;
}

const EmployeeLeaveRequestPage = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'history' | 'balance'>('request');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    justification: '',
    attachmentId: ''
  });

  // Mock current user - replace with actual auth
  const currentUserId = 'employee-id-here';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch leave types
      const typesResponse = await fetch(`${API_URL}/leaves/types`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (typesResponse.ok) {
        const types = await typesResponse.json();
        setLeaveTypes(types.leaveTypes || []);
      }

      // Fetch leave balances
      const balanceResponse = await fetch(`${API_URL}/leaves/balance`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (balanceResponse.ok) {
        const balances = await balanceResponse.json();
        setLeaveBalances(balances || []);
      }

      // Fetch leave requests
      const requestsResponse = await fetch(`${API_URL}/leaves/requests/my-requests`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();
        setLeaveRequests(requests.requests || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to load leave data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateLeaveRequest = async () => {
    if (!formData.leaveTypeId || !formData.fromDate || !formData.toDate || !formData.justification) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/leaves/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create leave request');
      }

      showNotification('Leave request submitted successfully!', 'success');
      setShowCreateModal(false);
      setFormData({
        leaveTypeId: '',
        fromDate: '',
        toDate: '',
        justification: '',
        attachmentId: ''
      });
      fetchData();
    } catch (error: any) {
      showNotification(error.message || 'Failed to submit leave request', 'error');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;

    try {
      const response = await fetch(`${API_URL}/leaves/requests/${requestId}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (!response.ok) throw new Error('Failed to cancel request');

      showNotification('Leave request cancelled successfully', 'success');
      fetchData();
    } catch (error: any) {
      showNotification(error.message || 'Failed to cancel request', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-200 text-yellow-800',
      approved: 'bg-green-200 text-green-800',
      rejected: 'bg-red-200 text-red-800',
      cancelled: 'bg-gray-200 text-gray-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-200 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="text-green-600" size={20} />
          ) : (
            <AlertCircle className="text-red-600" size={20} />
          )}
          <p className={`text-sm font-medium ${
            notification.type === 'success' ? 'text-green-900' : 'text-red-900'
          }`}>
            {notification.message}
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Leave Management</h1>
            <p className="text-gray-500 mt-1">Manage your leave requests and balances</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
          >
            <Plus size={20} />
            Request Leave
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('request')}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === 'request'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Requests
              </button>
              <button
                onClick={() => setActiveTab('balance')}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === 'balance'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Leave Balance
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : activeTab === 'request' ? (
              <LeaveRequestsTab
                requests={leaveRequests}
                onViewDetail={(req) => {
                  setSelectedRequest(req);
                  setShowDetailModal(true);
                }}
                onCancel={handleCancelRequest}
                getStatusBadge={getStatusBadge}
              />
            ) : (
              <LeaveBalanceTab balances={leaveBalances} />
            )}
          </div>
        </div>
      </div>

      {/* Create Leave Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Request Leave</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
                <select
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name} ({type.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date *</label>
                  <input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date *</label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Justification *</label>
                <textarea
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide reason for leave..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLeaveRequest}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Leave Request Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Leave Type</p>
                  <p className="font-semibold">{selectedRequest.leaveTypeId?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <p className="text-xs text-gray-500">From Date</p>
                  <p className="font-semibold">{new Date(selectedRequest.dates.from).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">To Date</p>
                  <p className="font-semibold">{new Date(selectedRequest.dates.to).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold">{selectedRequest.durationDays} days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Requested On</p>
                  <p className="font-semibold">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Justification</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedRequest.justification}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Approval Flow</h3>
                <div className="space-y-3">
                  {selectedRequest.approvalFlow.map((flow, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        flow.status === 'approved' ? 'bg-green-100' :
                        flow.status === 'rejected' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }`}>
                        {flow.status === 'approved' ? <CheckCircle className="text-green-600" size={20} /> :
                         flow.status === 'rejected' ? <X className="text-red-600" size={20} /> :
                         <Clock className="text-yellow-600" size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{flow.role.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-gray-500">
                          {flow.status === 'pending' ? 'Pending approval' : 
                           flow.decidedAt ? new Date(flow.decidedAt).toLocaleDateString() : 'Processing'}
                        </p>
                      </div>
                      {getStatusBadge(flow.status)}
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <button
                  onClick={() => {
                    handleCancelRequest(selectedRequest._id);
                    setShowDetailModal(false);
                  }}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LeaveRequestsTab = ({ requests, onViewDetail, onCancel, getStatusBadge }: any) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg text-gray-500">No leave requests yet</p>
        <p className="text-sm text-gray-400 mt-2">Click "Request Leave" to submit your first request</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {requests.map((request: LeaveRequest) => (
            <tr key={request._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {request.leaveTypeId?.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(request.dates.from).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(request.dates.to).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{request.durationDays} days</td>
              <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewDetail(request)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  {request.status === 'pending' && (
                    <button
                      onClick={() => onCancel(request._id)}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LeaveBalanceTab = ({ balances }: { balances: LeaveBalance[] }) => {
  if (balances.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg text-gray-500">No leave balance information available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {balances.map((balance) => (
        <div key={balance.leaveType._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{balance.leaveType.name}</h3>
              <p className="text-sm text-gray-500">{balance.leaveType.code}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              balance.leaveType.paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {balance.leaveType.paid ? 'Paid' : 'Unpaid'}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Yearly Entitlement</span>
              <span className="font-semibold">{balance.yearlyEntitlement} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Accrued</span>
              <span className="font-semibold">{balance.accruedRounded} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Carry Forward</span>
              <span className="font-semibold">{balance.carryForward} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taken</span>
              <span className="font-semibold text-red-600">{balance.taken} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{balance.pending} days</span>
            </div>
            <div className="pt-3 border-t flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">Remaining Balance</span>
              <span className="text-2xl font-bold text-green-600">{balance.remaining} days</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeLeaveRequestPage;