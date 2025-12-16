"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, X, Filter, Clock, AlertCircle, UserCheck } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LeaveRequest {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department?: string;
  };
  leaveTypeId: {
    _id: string;
    code: string;
    name: string;
    paid: boolean;
  };
  dates: { from: Date; to: Date };
  durationDays: number;
  justification: string;
  status: string;
  approvalFlow: Array<{
    role: string;
    status: string;
    decidedBy?: any;
    decidedAt?: Date;
  }>;
  createdAt: Date;
}

const LeaveApprovalPage = () => {
  const [activeTab, setActiveTab] = useState<'manager' | 'hr'>('manager');
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    department: '',
    leaveType: ''
  });
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionData, setActionData] = useState({
    comments: '',
    reason: ''
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Mock user role - replace with actual auth
  const userRole = 'manager'; // or 'hr'

  useEffect(() => {
    fetchRequests();
  }, [activeTab, filters.status]);

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

  const fetchRequests = async () => {
    try {
      setLoading(true);

      if (activeTab === 'manager') {
        // Fetch pending requests for manager approval
        const response = await fetch(`${API_URL}/leaves/requests/pending-approval`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPendingRequests(data.requests || []);
        }
      } else {
        // Fetch all requests for HR review
        const params = new URLSearchParams();
        if (filters.status !== 'all') params.append('status', filters.status);
        
        const response = await fetch(`${API_URL}/leaves/admin/requests?${params}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAllRequests(data.requests || []);
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      showNotification('Failed to load leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const endpoint = activeTab === 'manager' 
        ? `/leaves/requests/${requestId}/approve`
        : `/leaves/admin/requests/${requestId}/approve`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ comments: actionData.comments })
      });

      if (!response.ok) throw new Error('Failed to approve request');

      showNotification('Leave request approved successfully!', 'success');
      setShowActionModal(false);
      setShowDetailModal(false);
      setActionData({ comments: '', reason: '' });
      fetchRequests();
    } catch (error: any) {
      showNotification(error.message || 'Failed to approve request', 'error');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!actionData.reason) {
      showNotification('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      const endpoint = activeTab === 'manager'
        ? `/leaves/requests/${requestId}/reject`
        : `/leaves/admin/requests/${requestId}/reject`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ reason: actionData.reason })
      });

      if (!response.ok) throw new Error('Failed to reject request');

      showNotification('Leave request rejected', 'success');
      setShowActionModal(false);
      setShowDetailModal(false);
      setActionData({ comments: '', reason: '' });
      fetchRequests();
    } catch (error: any) {
      showNotification(error.message || 'Failed to reject request', 'error');
    }
  };

  const handleOverride = async (requestId: string) => {
    try {
      const response = await fetch(`${API_URL}/leaves/admin/requests/${requestId}/override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ comments: actionData.comments })
      });

      if (!response.ok) throw new Error('Failed to override request');

      showNotification('Leave request overridden and approved!', 'success');
      setShowActionModal(false);
      setShowDetailModal(false);
      setActionData({ comments: '', reason: '' });
      fetchRequests();
    } catch (error: any) {
      showNotification(error.message || 'Failed to override request', 'error');
    }
  };

  const openActionModal = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setShowActionModal(true);
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

  const requests = activeTab === 'manager' ? pendingRequests : allRequests;

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
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leave Approvals</h1>
          <p className="text-gray-500 mt-1">Review and approve employee leave requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {pendingRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock size={40} className="text-yellow-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Approved Today</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <CheckCircle size={40} className="text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-blue-600">{requests.length}</p>
              </div>
              <UserCheck size={40} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('manager')}
                  className={`px-6 py-4 font-medium transition ${
                    activeTab === 'manager'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Manager Approval ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setActiveTab('hr')}
                  className={`px-6 py-4 font-medium transition ${
                    activeTab === 'hr'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  HR Review ({allRequests.length})
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {activeTab === 'hr' && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-4">
                <Filter size={20} className="text-gray-500" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg text-gray-500">No leave requests to review</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.employeeId?.firstName} {request.employeeId?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{request.employeeId?.employeeNumber}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{request.leaveTypeId?.name}</td>
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
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => openActionModal(request, 'approve')}
                                  className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => openActionModal(request, 'reject')}
                                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                                  title="Reject"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            {activeTab === 'hr' && request.status === 'rejected' && (
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setActionType('approve');
                                  setShowActionModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded text-xs"
                                title="Override"
                              >
                                Override
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
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
                  <p className="text-xs text-gray-500">Employee</p>
                  <p className="font-semibold">
                    {selectedRequest.employeeId?.firstName} {selectedRequest.employeeId?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{selectedRequest.employeeId?.employeeNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-semibold">{selectedRequest.employeeId?.department || 'N/A'}</p>
                </div>
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
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setActionType('approve');
                      setShowActionModal(true);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setActionType('reject');
                      setShowActionModal(true);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Employee</p>
                <p className="font-semibold">
                  {selectedRequest.employeeId?.firstName} {selectedRequest.employeeId?.lastName}
                </p>
                <p className="text-sm text-gray-600 mt-2">Duration</p>
                <p className="font-semibold">{selectedRequest.durationDays} days</p>
              </div>

              {actionType === 'approve' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={actionData.comments}
                    onChange={(e) => setActionData({ ...actionData, comments: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any comments..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={actionData.reason}
                    onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Please provide a reason..."
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setActionData({ comments: '', reason: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionType === 'approve') {
                      if (selectedRequest.status === 'rejected' && activeTab === 'hr') {
                        handleOverride(selectedRequest._id);
                      } else {
                        handleApprove(selectedRequest._id);
                      }
                    } else {
                      handleReject(selectedRequest._id);
                    }
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovalPage;