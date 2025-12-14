"use client"
import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Calendar, X, Building2, User, Loader2, CheckCircle, AlertCircle, FileText, Send, Settings, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Edit Run Modal Component
const EditRunModal = ({ run, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    runId: run?.runId || '',
    payrollPeriod: run?.payrollPeriod ? new Date(run.payrollPeriod).toISOString().split('T')[0] : '',
    entity: run?.entity || '',
    payrollSpecialistId: run?.payrollSpecialistId || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!formData.runId || !formData.payrollPeriod || !formData.entity) {
      setError('Please fill in all required fields');
      return;
    }

    if (run.status !== 'DRAFT' && run.status !== 'REJECTED') {
      setError('Can only edit runs in DRAFT or REJECTED status');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const periodResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs/${run._id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payrollPeriod: new Date(formData.payrollPeriod).toISOString()
        })
      });

      if (!periodResponse.ok) {
        const errorData = await periodResponse.json();
        throw new Error(errorData.message || 'Failed to update payroll run');
      }

      onSuccess();
    } catch (err) {
      console.error('Error updating payroll run:', err);
      setError(err.message || 'Failed to update payroll run');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Payroll Run</h2>
            <p className="text-gray-600 text-sm mt-1">Modify payroll run details</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        {run.status !== 'DRAFT' && run.status !== 'REJECTED' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">Limited Editing</p>
                <p className="text-sm text-yellow-800 mt-1">
                  This run is in {run.status} status. Only DRAFT or REJECTED runs can be edited.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Run ID</label>
            <input
              type="text"
              value={formData.runId}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">Run ID cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="inline mr-1" size={16} />
              Payroll Period *
            </label>
            <input
              type="date"
              value={formData.payrollPeriod}
              onChange={(e) => setFormData({ ...formData, payrollPeriod: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={run.status !== 'DRAFT' && run.status !== 'REJECTED'}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="inline mr-1" size={16} />
              Entity/Company
            </label>
            <input
              type="text"
              value={formData.entity}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">Entity cannot be changed after creation</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="inline mr-1" size={16} />
              Payroll Specialist ID
            </label>
            <input
              type="text"
              value={formData.payrollSpecialistId}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Specialist cannot be changed</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (run.status !== 'DRAFT' && run.status !== 'REJECTED')}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Run Modal Component
const CreateRunModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    runId: `PR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
    payrollPeriod: '',
    payrollSpecialistId: '',
    entity: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preRunCheck, setPreRunCheck] = useState(null);

  useEffect(() => {
    checkPreRunApprovals();
  }, []);

  const checkPreRunApprovals = async () => {
    try {
      const response = await fetch(`${API_URL}/payroll-execution/pre-run-check`);
      if (!response.ok) throw new Error('Failed to check pre-run approvals');
      const data = await response.json();
      setPreRunCheck(data);
    } catch (err) {
      console.error('Error checking pre-run approvals:', err);
    }
  };

  const generateNewRunId = () => {
    setFormData({
      ...formData,
      runId: `PR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`
    });
  };

  const handleSubmit = async () => {
    if (!formData.runId || !formData.payrollPeriod || !formData.entity || !formData.payrollSpecialistId) {
      setError('Please fill in all required fields');
      return;
    }

    if (preRunCheck && !preRunCheck.allApprovalsComplete) {
      setError('Cannot create payroll run. Please complete all pre-run approvals first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          payrollPeriod: new Date(formData.payrollPeriod).toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payroll run');
      }

      await response.json();
      onSuccess();
    } catch (err) {
      console.error('Error creating payroll run:', err);
      setError(err.message || 'Failed to create payroll run');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Payroll Run</h2>
            <p className="text-gray-600 text-sm mt-1">Initialize a new payroll processing cycle</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        {preRunCheck && !preRunCheck.allApprovalsComplete && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-orange-900">Pre-Run Approvals Required</p>
                <ul className="text-sm text-orange-800 mt-2 space-y-1">
                  {preRunCheck.blockers && preRunCheck.blockers.map((blocker, idx) => (
                    <li key={idx}>• {blocker}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Run ID *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.runId}
                onChange={(e) => setFormData({ ...formData, runId: e.target.value })}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="PR-2024-1234"
              />
              <button
                type="button"
                onClick={generateNewRunId}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="inline mr-1" size={16} />
              Payroll Period *
            </label>
            <input
              type="date"
              value={formData.payrollPeriod}
              onChange={(e) => setFormData({ ...formData, payrollPeriod: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="inline mr-1" size={16} />
              Entity/Company *
            </label>
            <input
              type="text"
              value={formData.entity}
              onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="inline mr-1" size={16} />
              Payroll Specialist ID *
            </label>
            <input
              type="text"
              value={formData.payrollSpecialistId}
              onChange={(e) => setFormData({ ...formData, payrollSpecialistId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="675c8e9a1b2c3d4e5f6a7b8c"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (preRunCheck && !preRunCheck.allApprovalsComplete)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                'Create Payroll Run'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main All Runs Page Component
const AllRunsPage = () => {
  const router = useRouter();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    entity: '',
    searchTerm: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchPayrollRuns();
  }, [filters.status, filters.entity]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchPayrollRuns = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.entity) params.append('entity', filters.entity);

      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch payroll runs');
      
      const data = await response.json();
      
      let filteredData = data;
      if (filters.searchTerm) {
        filteredData = data.filter(run => 
          (run.runId && run.runId.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
          (run._id && run._id.toLowerCase().includes(filters.searchTerm.toLowerCase()))
        );
      }
      
      setRuns(filteredData);
    } catch (error) {
      console.error('Error fetching payroll runs:', error);
      showNotification('Failed to fetch payroll runs: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRun = (run) => {
    setSelectedRun(run);
    setShowEditModal(true);
  };

  const handleQuickAction = (runId, action) => {
    switch (action) {
      case 'pre-runs':
        router.push(`/runs/${runId}/pre-runs`);
        break;
      case 'draft':
        router.push(`/runs/${runId}/draft`);
        break;
      case 'approvals':
        router.push(`/runs/${runId}/approvals`);
        break;
      default:
        router.push(`/runs/${runId}/pre-runs`);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'DRAFT': { class: 'bg-gray-200 text-gray-800', label: 'Draft' },
      'UNDER_REVIEW': { class: 'bg-yellow-200 text-yellow-800', label: 'Under Review' },
      'PENDING_FINANCE_APPROVAL': { class: 'bg-orange-200 text-orange-800', label: 'Pending Finance' },
      'APPROVED': { class: 'bg-green-200 text-green-800', label: 'Approved' },
      'REJECTED': { class: 'bg-red-200 text-red-800', label: 'Rejected' },
      'LOCKED': { class: 'bg-purple-200 text-purple-800', label: 'Locked' },
      'UNLOCKED': { class: 'bg-blue-200 text-blue-800', label: 'Unlocked' }
    };

    const config = statusMap[status] || { class: 'bg-gray-200 text-gray-800', label: status };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">All Payroll Runs</h1>
            <p className="text-gray-600 mt-1">Manage and track all payroll processing cycles</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Create New Run
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="PENDING_FINANCE_APPROVAL">Pending Finance</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="LOCKED">Locked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
              <input
                type="text"
                value={filters.entity}
                onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                placeholder="Filter by entity..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  placeholder="Search by Run ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Loading payroll runs...</p>
            </div>
          ) : runs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">No payroll runs found</p>
              <p className="text-sm mt-2">Try adjusting your filters or create a new run</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exceptions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {runs.map((run) => (
                    <tr key={run._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{run.runId || run._id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          {new Date(run.payrollPeriod).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{run.entity || 'N/A'}</td>
                      <td className="px-6 py-4">{getStatusBadge(run.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{run.employees || 0}</td>
                      <td className="px-6 py-4 text-sm">
                        {(run.exceptions || 0) > 0 ? (
                          <span className="font-semibold text-red-600">{run.exceptions}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ${(run.totalnetpay || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleEditRun(run)}
                            className="text-gray-600 hover:bg-gray-50 px-2 py-1 rounded text-xs font-medium transition"
                            title="Edit Run"
                          >
                            <Edit size={16} className="inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleQuickAction(run._id, 'pre-runs')}
                            className="text-purple-600 hover:bg-purple-50 px-2 py-1 rounded text-xs font-medium transition"
                            title="Pre-run Approvals"
                          >
                            <CheckCircle size={16} className="inline mr-1" />
                            Pre-runs
                          </button>
                          <button
                            onClick={() => handleQuickAction(run._id, 'draft')}
                            className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-medium transition"
                            title="Draft Review"
                          >
                            <FileText size={16} className="inline mr-1" />
                            Draft
                          </button>
                          <button
                            onClick={() => handleQuickAction(run._id, 'approvals')}
                            className="text-green-600 hover:bg-green-50 px-2 py-1 rounded text-xs font-medium transition"
                            title="Approvals & Execution"
                          >
                            <Send size={16} className="inline mr-1" />
                            Approvals
                          </button>
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

      {showCreateModal && (
        <CreateRunModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            showNotification('Payroll run created successfully!');
            fetchPayrollRuns();
          }}
        />
      )}

      {showEditModal && selectedRun && (
        <EditRunModal
          run={selectedRun}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRun(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedRun(null);
            showNotification('Payroll run updated successfully!');
            fetchPayrollRuns();
          }}
        />
      )}
    </div>
  );
};

export default AllRunsPage;