'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LeaveRequest {
  _id: string;
  leaveTypeId: {
    _id: string;
    name: string;
    code: string;
  };
  dates: {
    from: Date;
    to: Date;
  };
  durationDays: number;
  status: string;
  justification?: string;
  createdAt: Date;
  approvalFlow: Array<{
    role: string;
    status: string;
    decidedBy?: any;
    decidedAt?: Date;
  }>;
}

export default function MyLeaveRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, [filter, page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params: any = { page, limit: 10 };
      if (filter) params.status = filter;

      const response = await axios.get(`${API_URL}/leaves/requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setRequests(response.data.requests ||[]);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PENDING_HR':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/leaves/requests/${requestId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests(); // Refresh list
      alert('Request cancelled successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Leave Requests</h1>
            <p className="text-gray-600 mt-2">View and manage your leave requests</p>
          </div>
          <button
            onClick={() => router.push('/leaves/request')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            + New Request
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PENDING_HR">Pending HR</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No leave requests found</p>
            <button
              onClick={() => router.push('/leaves/request')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Submit your first request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.leaveTypeId.name}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">From:</span>
                        <p className="font-medium">{formatDate(request.dates.from)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">To:</span>
                        <p className="font-medium">{formatDate(request.dates.to)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-medium">{request.durationDays} days</p>
                      </div>
                    </div>

                    {request.justification && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <span className="text-xs text-gray-600">Justification:</span>
                        <p className="text-sm text-gray-700 mt-1">{request.justification}</p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Submitted on {formatDate(request.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelRequest(request._id)}
                      className="ml-4 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
