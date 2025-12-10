"use client"
import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Eye, Calendar } from 'lucide-react';
import payrollService from '@/lib/payrollService';

const AllRunsPage = () => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    entity: '',
    searchTerm: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPayrollRuns();
  }, [filters.status, filters.entity]);

  const fetchPayrollRuns = async () => {
    try {
      setLoading(true);
      const data = await payrollService.getAllPayrollRuns({
        status: filters.status,
        entity: filters.entity
      });
      
      let filteredData = data;
      if (filters.searchTerm) {
        filteredData = data.filter(run => 
          run.runId.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }
      
      setRuns(filteredData);
    } catch (error) {
      console.error('Error fetching payroll runs:', error);
      alert('Failed to fetch payroll runs: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRun = async (runId) => {
    if (!window.confirm('Are you sure you want to delete this payroll run?')) return;
    
    try {
      await payrollService.deletePayrollRun(runId);
      alert('Payroll run deleted successfully');
      fetchPayrollRuns();
    } catch (error) {
      console.error('Error deleting run:', error);
      alert(error.message || 'Failed to delete payroll run');
    }
  };

  const handleViewPreRun = (runId) => {
    window.location.href = `/payroll/runs/${runId}/pre-run`;
  };

  const getStatusBadge = (status) => {
    const colors = {
      'draft': 'bg-gray-200 text-gray-800',
      'under review': 'bg-yellow-200 text-yellow-800',
      'pending finance approval': 'bg-orange-200 text-orange-800',
      'approved': 'bg-green-200 text-green-800',
      'rejected': 'bg-red-200 text-red-800',
      'locked': 'bg-purple-200 text-purple-800',
      'unlocked': 'bg-blue-200 text-blue-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-200 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">All Payroll Runs</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="under review">Under Review</option>
                <option value="pending finance approval">Pending Finance</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="locked">Locked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
              <input
                type="text"
                value={filters.entity}
                onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                placeholder="Filter by entity..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <p className="text-lg">No payroll runs found</p>
              <p className="text-sm mt-2">Try adjusting your filters or create a new run</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Run ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exceptions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {runs.map((run) => (
                    <tr key={run._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{run.runId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={16} />
                          {new Date(run.payrollPeriod).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{run.entity}</td>
                      <td className="px-6 py-4">{getStatusBadge(run.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{run.employees}</td>
                      <td className="px-6 py-4 text-sm">
                        {run.exceptions > 0 ? (
                          <span className="font-semibold text-red-600">{run.exceptions}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${run.totalnetpay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewPreRun(run._id)}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            title="View Pre-Run"
                          >
                            <Eye size={18} />
                          </button>
                          {(run.status === 'draft' || run.status === 'rejected') && (
                            <button
                              onClick={() => handleDeleteRun(run._id)}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={18} />
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

      {showCreateModal && (
        <CreateRunModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPayrollRuns();
          }}
        />
      )}
    </div>
  );
};

const CreateRunModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    runId: `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    payrollPeriod: '',
    payrollSpecialistId: '',
    entity: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.runId || !formData.payrollPeriod || !formData.entity || !formData.payrollSpecialistId) {
      alert('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      await payrollService.createPayrollRun(formData);
      alert('Payroll run created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating run:', error);
      alert(error.message || 'Failed to create payroll run');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Create New Payroll Run</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Run ID</label>
            <input
              type="text"
              value={formData.runId}
              onChange={(e) => setFormData({ ...formData, runId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payroll Period</label>
            <input
              type="date"
              value={formData.payrollPeriod}
              onChange={(e) => setFormData({ ...formData, payrollPeriod: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
            <input
              type="text"
              value={formData.entity}
              onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
              placeholder="Company name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialist ID</label>
            <input
              type="text"
              value={formData.payrollSpecialistId}
              onChange={(e) => setFormData({ ...formData, payrollSpecialistId: e.target.value })}
              placeholder="Employee ID..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRunsPage;