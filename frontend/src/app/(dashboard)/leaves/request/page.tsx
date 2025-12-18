'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LeaveType {
  _id: string;
  code: string;
  name: string;
  description?: string;
  requiresAttachment: boolean;
  maxDurationDays?: number;
}

interface LeaveBalance {
  leaveType: {
    _id: string;
    name: string;
    code: string;
  };
  yearlyEntitlement: number;
  remaining: number;
  taken: number;
  pending: number;
  carryForward: number;
}

export default function SubmitLeaveRequestPage() {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    justification: '',
    attachmentId: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch leave types and balances on mount
  useEffect(() => {
    fetchLeaveTypes();
    fetchBalances();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/leaves/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveTypes(response.data.leaveTypes || []);
    } catch (err: any) {
      console.error('Error fetching leave types:', err);
    }
  };

  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/leaves/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalances(response.data || []);
    } catch (err: any) {
      console.error('Error fetching balances:', err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Upload file immediately
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await axios.post(
          `${API_URL}/leaves/attachments/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        setFormData((prev) => ({ ...prev, attachmentId: response.data.fileId }));
        setSuccess('File uploaded successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'File upload failed');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate
    if (!formData.leaveTypeId || !formData.fromDate || !formData.toDate) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    // Check if selected leave type requires attachment
    const selectedType = leaveTypes.find((t) => t._id === formData.leaveTypeId);
    if (selectedType?.requiresAttachment && !formData.attachmentId) {
      setError('This leave type requires an attachment');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/leaves/requests`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Leave request submitted successfully!');
      setTimeout(() => router.push('/leaves/my-requests'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = leaveTypes.find((t) => t._id === formData.leaveTypeId);
  const selectedBalance = balances.find((b) => b.leaveType._id === formData.leaveTypeId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Submit Leave Request</h1>
          <p className="text-gray-600 mt-2">Request time off by filling out the form below</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.leaveTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, leaveTypeId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
              {selectedType?.description && (
                <p className="mt-2 text-sm text-gray-500">{selectedType.description}</p>
              )}
            </div>

            {/* Balance Display */}
            {selectedBalance && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Your Balance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Entitlement:</span>
                    <p className="font-bold text-blue-900">{selectedBalance.yearlyEntitlement} days</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Remaining:</span>
                    <p className="font-bold text-green-600">{selectedBalance.remaining} days</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Taken:</span>
                    <p className="font-bold text-gray-700">{selectedBalance.taken} days</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Pending:</span>
                    <p className="font-bold text-orange-600">{selectedBalance.pending} days</p>
                  </div>
                </div>
              </div>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) =>
                    setFormData({ ...formData, fromDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.toDate}
                  onChange={(e) =>
                    setFormData({ ...formData, toDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Justification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justification
              </label>
              <textarea
                value={formData.justification}
                onChange={(e) =>
                  setFormData({ ...formData, justification: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide reason for leave request..."
              />
            </div>

            {/* File Attachment */}
            {selectedType?.requiresAttachment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={selectedType.requiresAttachment}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Accepted formats: PDF, JPG, PNG (Max 5MB)
                </p>
                {file && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {file.name} uploaded successfully
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/leaves/my-requests')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
