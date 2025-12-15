"use client"
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  X, 
  Building2, 
  User, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Edit,
  PlayCircle,
  Eye,
  Lock,
  Unlock,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import CreateRunModal from '@/components/CreateRunModal';

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

  const canEdit = run?.status === 'DRAFT' || run?.status === 'REJECTED';

  const handleSubmit = async () => {
    if (!formData.payrollPeriod) {
      setError('Payroll period is required');
      return;
    }

    if (!canEdit) {
      setError('Can only edit runs in DRAFT or REJECTED status');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const runIdentifier = run._id || run.id;
      
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${runIdentifier}/edit`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          payrollPeriod: new Date(formData.payrollPeriod).toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update payroll run (${response.status})`);
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Edit Payroll Run</h2>
            <p className="text-slate-600 text-sm mt-1">Modify payroll run details</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {!canEdit && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-amber-900">Limited Editing</p>
                <p className="text-sm text-amber-800 mt-1">
                  This run is in <strong>{run?.status}</strong> status. Only DRAFT or REJECTED runs can be edited.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Run ID</label>
            <input
              type="text"
              value={formData.runId}
              disabled
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Run ID cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Calendar className="inline mr-1" size={16} />
              Payroll Period *
            </label>
            <input
              type="date"
              value={formData.payrollPeriod}
              onChange={(e) => setFormData({ ...formData, payrollPeriod: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl transition ${
                canEdit 
                  ? 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                  : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
              }`}
              disabled={!canEdit}
            />
            {canEdit && (
              <p className="text-xs text-slate-500 mt-1">Select the payroll period end date</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Building2 className="inline mr-1" size={16} />
              Entity/Company
            </label>
            <input
              type="text"
              value={formData.entity}
              disabled
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Entity cannot be changed after creation</p>
          </div>

          <div className="pt-2 pb-2 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-medium text-slate-600 mb-2">Current Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              run?.status === 'DRAFT' ? 'bg-slate-200 text-slate-800' :
              run?.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
              run?.status === 'UNDER_REVIEW' ? 'bg-amber-200 text-amber-800' :
              run?.status === 'PENDING_MANAGER_APPROVAL' ? 'bg-orange-200 text-orange-800' :
              run?.status === 'PENDING_FINANCE_APPROVAL' ? 'bg-yellow-200 text-yellow-800' :
              run?.status === 'APPROVED' ? 'bg-emerald-200 text-emerald-800' :
              run?.status === 'LOCKED' ? 'bg-purple-200 text-purple-800' :
              'bg-blue-200 text-blue-800'
            }`}>
              {run?.status?.replace(/_/g, ' ') || 'Unknown'}
            </span>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canEdit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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

  const handleViewRun = (runId) => {
    router.push(`/runs/${runId}`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'DRAFT': { class: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Draft', icon: FileText },
      'UNDER_REVIEW': { class: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Under Review', icon: Eye },
      'PENDING_MANAGER_APPROVAL': { class: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Pending Manager', icon: AlertCircle },
      'PENDING_FINANCE_APPROVAL': { class: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending Finance', icon: DollarSign },
      'APPROVED': { class: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Approved', icon: CheckCircle },
      'REJECTED': { class: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected', icon: X },
      'LOCKED': { class: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Locked', icon: Lock },
      'UNLOCKED': { class: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Unlocked', icon: Unlock }
    };

    const config = statusMap[status] || { class: 'bg-slate-100 text-slate-700 border-slate-200', label: status, icon: FileText };
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${config.class}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getQuickActions = (run) => {
    const actions = [];

    switch (run.status) {
      case 'DRAFT':
        actions.push(
          { label: 'Edit', icon: Edit, color: 'slate', action: () => handleEditRun(run) },
          { label: 'Review Pre-runs', icon: CheckCircle, color: 'purple', action: () => router.push(`/runs/${run._id}/pre-runs`) },
          { label: 'Start Processing', icon: PlayCircle, color: 'blue', action: () => router.push(`/runs/${run._id}/initiate`) }
        );
        break;
      
      case 'UNDER_REVIEW':
        actions.push(
          { label: 'View Details', icon: Eye, color: 'blue', action: () => handleViewRun(run._id) },
          { label: 'Review Draft', icon: FileText, color: 'amber', action: () => router.push(`/runs/${run._id}/review`) },
          { label: 'Exceptions', icon: AlertTriangle, color: 'orange', action: () => router.push(`/runs/${run._id}/exceptions`) }
        );
        break;
      
      case 'PENDING_MANAGER_APPROVAL':
      case 'PENDING_FINANCE_APPROVAL':
        actions.push(
          { label: 'View Details', icon: Eye, color: 'blue', action: () => handleViewRun(run._id) },
          { label: 'Approval Panel', icon: CheckCircle, color: 'green', action: () => router.push(`/runs/${run._id}/approvals`) }
        );
        break;
      
      case 'APPROVED':
      case 'LOCKED':
        actions.push(
          { label: 'View Details', icon: Eye, color: 'blue', action: () => handleViewRun(run._id) },
          { label: 'View Payslips', icon: FileText, color: 'green', action: () => router.push(`/runs/${run._id}/payslips`) }
        );
        if (run.status === 'LOCKED') {
          actions.push(
            { label: 'Unlock', icon: Unlock, color: 'red', action: () => router.push(`/runs/${run._id}/unlock`) }
          );
        }
        break;
      
      case 'REJECTED':
        actions.push(
          { label: 'Edit & Restart', icon: Edit, color: 'slate', action: () => handleEditRun(run) },
          { label: 'View Details', icon: Eye, color: 'blue', action: () => handleViewRun(run._id) }
        );
        break;
      
      default:
        actions.push(
          { label: 'View Details', icon: Eye, color: 'blue', action: () => handleViewRun(run._id) }
        );
    }

    return actions;
  };

  const stats = {
    total: runs.length,
    draft: runs.filter(r => r.status === 'DRAFT').length,
    underReview: runs.filter(r => r.status === 'UNDER_REVIEW').length,
    pendingApproval: runs.filter(r => r.status === 'PENDING_MANAGER_APPROVAL' || r.status === 'PENDING_FINANCE_APPROVAL').length,
    approved: runs.filter(r => r.status === 'APPROVED').length,
    locked: runs.filter(r => r.status === 'LOCKED').length,
    totalEmployees: runs.reduce((sum, r) => sum + (r.employees || 0), 0),
    totalNetPay: runs.reduce((sum, r) => sum + (r.totalnetpay || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Payroll Runs</h1>
              <p className="text-slate-600">Manage and track all payroll processing cycles</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl font-medium"
            >
              <Plus size={20} />
              Create New Run
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-8 space-y-6">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="text-emerald-600" size={20} />
            ) : (
              <AlertCircle className="text-red-600" size={20} />
            )}
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-emerald-900' : 'text-red-900'
            }`}>
              {notification.message}
            </p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Runs</p>
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-slate-600">Draft: {stats.draft}</span>
              <span className="text-amber-600">Review: {stats.underReview}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Pending Approval</p>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingApproval}</p>
            <p className="text-xs text-slate-500 mt-2">Requires manager or finance approval</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Approved & Locked</p>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.approved + stats.locked}</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-emerald-600">Approved: {stats.approved}</span>
              <span className="text-purple-600">Locked: {stats.locked}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Net Pay</p>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">
              ${stats.totalNetPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-2">{stats.totalEmployees} employees total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 transition"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="PENDING_MANAGER_APPROVAL">Pending Manager</option>
                <option value="PENDING_FINANCE_APPROVAL">Pending Finance</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="LOCKED">Locked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Entity</label>
              <input
                type="text"
                value={filters.entity}
                onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                placeholder="Filter by entity..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  placeholder="Search by Run ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Runs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="relative mx-auto w-16 h-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600" />
                <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-400 animate-ping" style={{ animationDuration: '1.5s' }} />
              </div>
              <p className="mt-4 text-slate-600 font-medium">Loading payroll runs...</p>
            </div>
          ) : runs.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-semibold text-slate-900">No payroll runs found</p>
              <p className="text-sm text-slate-500 mt-2">Try adjusting your filters or create a new run</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Run ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Employees</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Exceptions</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Total Net Pay</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {runs.map((run) => {
                    const actions = getQuickActions(run);
                    
                    return (
                      <tr key={run._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-900">{run.runId || run._id}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{run._id?.slice(0, 8)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar size={16} className="text-slate-400" />
                            {new Date(run.payrollPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Building2 size={16} className="text-slate-400" />
                            {run.entity || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(run.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-900">{run.employees || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {run.exceptions > 0 ? (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold inline-flex items-center gap-1">
                              <AlertTriangle size={12} />
                              {run.exceptions}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-900">
                            ${(run.totalnetpay || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {actions.slice(0, 2).map((action, idx) => {
                              const ActionIcon = action.icon;
                              return (
                                <button
                                  key={idx}
                                  onClick={action.action}
                                  className={`p-2 rounded-lg transition-all hover:scale-105 ${
                                    action.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                    action.color === 'green' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                    action.color === 'amber' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                    action.color === 'orange' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                                    action.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                                    action.color === 'red' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                    'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                  title={action.label}
                                >
                                  <ActionIcon size={16} />
                                </button>
                              );
                            })}
                            {actions.length > 2 && (
                              <button
                                onClick={() => handleViewRun(run._id)}
                                className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all hover:scale-105"
                                title="View all actions"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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