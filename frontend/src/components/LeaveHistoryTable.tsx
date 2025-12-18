'use client';

import { useState } from 'react';

interface LeaveRequest {
  _id: string;
  leaveTypeId: { name: string; code: string };
  dates: { from: string; to: string };
  durationDays: number;
  status: string;
  createdAt: string;
}

interface LeaveHistoryTableProps {
  requests: LeaveRequest[];
  onUpdate: () => void;
}

export default function LeaveHistoryTable({ requests, onUpdate }: LeaveHistoryTableProps) {
  const [sortField, setSortField] = useState<'createdAt' | 'from'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'createdAt' | 'from') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    const aVal = sortField === 'createdAt' ? a.createdAt : a.dates.from;
    const bVal = sortField === 'createdAt' ? b.createdAt : b.dates.from;
    
    const comparison = new Date(aVal).getTime() - new Date(bVal).getTime();
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles] || styles.PENDING
        }`}
      >
        {status}
      </span>
    );
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500">No leave requests found</p>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Leave Type
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('from')}
            >
              From - To {sortField === 'from' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('createdAt')}
            >
              Requested {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedRequests.map((request) => (
            <tr key={request._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {request.leaveTypeId?.name}
                </div>
                <div className="text-sm text-gray-500">{request.leaveTypeId?.code}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{new Date(request.dates.from).toLocaleDateString()}</div>
                <div>{new Date(request.dates.to).toLocaleDateString()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.durationDays} days
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(request.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
