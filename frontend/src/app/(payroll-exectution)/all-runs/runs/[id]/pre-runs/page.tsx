"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock payrollService
const payrollService = {
  getPendingSigningBonuses: async () => {
    const response = await fetch('http://localhost:3000/payroll-execution/signing-bonuses/pending');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },
  getPendingBenefits: async () => {
    const response = await fetch('http://localhost:3000/payroll-execution/benefits/pending');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },
  approveSigningBonus: async (id) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/signing-bonuses/${id}/approve`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to approve');
    return response.json();
  },
  rejectSigningBonus: async (id) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/signing-bonuses/${id}/reject`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to reject');
    return response.json();
  },
  approveBenefit: async (id) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/benefits/${id}/approve`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to approve');
    return response.json();
  },
  rejectBenefit: async (id) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/benefits/${id}/reject`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to reject');
    return response.json();
  }
};

const PreRunApprovalsPage = () => {
  const [activeTab, setActiveTab] = useState('bonuses');
  const [bonuses, setBonuses] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const [bonusesData, benefitsData] = await Promise.all([
        payrollService.getPendingSigningBonuses(),
        payrollService.getPendingBenefits()
      ]);
      setBonuses(bonusesData);
      setBenefits(benefitsData);
    } catch (error) {
      console.error('Error fetching pending items:', error);
      toast.error('Failed to fetch pending approvals: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      if (type === 'bonus') {
        await payrollService.approveSigningBonus(id);
      } else {
        await payrollService.approveBenefit(id);
      }
      toast.success('Approved successfully');
      setSelectedItems([]);
      fetchPendingItems();
    } catch (error) {
      console.error('Error approving:', error);
      toast.error(error.message || 'Failed to approve');
    }
  };

  const handleReject = async (id, type) => {
    try {
      if (type === 'bonus') {
        await payrollService.rejectSigningBonus(id);
      } else {
        await payrollService.rejectBenefit(id);
      }
      toast.success('Rejected successfully');
      setSelectedItems([]);
      fetchPendingItems();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error(error.message || 'Failed to reject');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    const type = activeTab === 'bonuses' ? 'bonus' : 'benefit';
    const confirmMsg = `Are you sure you want to ${action} ${selectedItems.length} item(s)?`;
    
    if (!window.confirm(confirmMsg)) return;

    const loadingToast = toast.loading(`Processing ${selectedItems.length} item(s)...`);

    try {
      await Promise.all(
        selectedItems.map(id => 
          action === 'approve' ? handleApprove(id, type) : handleReject(id, type)
        )
      );
      toast.success(`Bulk ${action} completed successfully`, { id: loadingToast });
      setSelectedItems([]);
      fetchPendingItems();
    } catch (error) {
      console.error(`Bulk ${action} error:`, error);
      toast.error(`Some items failed to ${action}`, { id: loadingToast });
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const items = activeTab === 'bonuses' ? bonuses : benefits;
    if (selectedItems.length === items.length && items.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
  };

  const goBack = () => {
    window.location.href = '/all-runs/runs';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={goBack}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
          >
            <ArrowLeft size={20} />
            Back to All Runs
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Pre-Run Approvals</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => {
                  setActiveTab('bonuses');
                  setSelectedItems([]);
                }}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === 'bonuses'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Signing Bonuses ({bonuses.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('benefits');
                  setSelectedItems([]);
                }}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === 'benefits'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Termination/Resignation Benefits ({benefits.length})
              </button>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="p-4 bg-blue-50 flex items-center justify-between border-b">
              <span className="text-sm font-medium text-gray-700">
                {selectedItems.length} item(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
                >
                  <CheckCircle size={16} />
                  Bulk Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
                >
                  <XCircle size={16} />
                  Bulk Reject
                </button>
              </div>
            </div>
          )}

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4">Loading pending items...</p>
              </div>
            ) : activeTab === 'bonuses' ? (
              <BonusesTable
                bonuses={bonuses}
                selectedItems={selectedItems}
                onToggleSelect={toggleSelectItem}
                onSelectAll={selectAll}
                onApprove={(id) => handleApprove(id, 'bonus')}
                onReject={(id) => handleReject(id, 'bonus')}
              />
            ) : (
              <BenefitsTable
                benefits={benefits}
                selectedItems={selectedItems}
                onToggleSelect={toggleSelectItem}
                onSelectAll={selectAll}
                onApprove={(id) => handleApprove(id, 'benefit')}
                onReject={(id) => handleReject(id, 'benefit')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BonusesTable = ({ bonuses, selectedItems, onToggleSelect, onSelectAll, onApprove, onReject }) => {
  if (bonuses.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg text-gray-500">No pending signing bonuses</p>
        <p className="text-sm text-gray-400 mt-2">All bonuses have been processed</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === bonuses.length && bonuses.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {bonuses.map((bonus) => (
            <tr key={bonus._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(bonus._id)}
                  onChange={() => onToggleSelect(bonus._id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {bonus.employeeId?.firstName} {bonus.employeeId?.lastName}
                </div>
                <div className="text-xs text-gray-500">{bonus.employeeId?.email}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {bonus.employeeId?.department || 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                ${bonus.givenAmount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {bonus.paymentDate ? new Date(bonus.paymentDate).toLocaleDateString() : 'Not set'}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-800">
                  {bonus.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(bonus._id)}
                    className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition"
                    title="Approve"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => onReject(bonus._id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                    title="Reject"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BenefitsTable = ({ benefits, selectedItems, onToggleSelect, onSelectAll, onApprove, onReject }) => {
  if (benefits.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg text-gray-500">No pending termination/resignation benefits</p>
        <p className="text-sm text-gray-400 mt-2">All benefits have been processed</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === benefits.length && benefits.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {benefits.map((benefit) => (
            <tr key={benefit._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(benefit._id)}
                  onChange={() => onToggleSelect(benefit._id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {benefit.employeeId?.firstName} {benefit.employeeId?.lastName}
                </div>
                <div className="text-xs text-gray-500">{benefit.employeeId?.email}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {benefit.employeeId?.department || 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                ${benefit.givenAmount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {benefit.benefitId?.type || 'Termination Benefit'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {benefit.createdAt ? new Date(benefit.createdAt).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-800">
                  {benefit.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(benefit._id)}
                    className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition"
                    title="Approve"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => onReject(benefit._id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                    title="Reject"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreRunApprovalsPage;