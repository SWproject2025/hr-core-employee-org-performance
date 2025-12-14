"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Calendar, Settings, FileText, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface LeaveType {
  _id: string;
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  paid: boolean;
  deductible: boolean;
  requiresAttachment: boolean;
  minTenureMonths?: number;
  maxDurationDays?: number;
}

interface LeavePolicy {
  _id: string;
  leaveTypeId: string;
  accrualMethod: string;
  monthlyRate: number;
  yearlyRate: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  roundingRule: string;
  minNoticeDays: number;
  maxConsecutiveDays?: number;
}

const LeavePolicyConfigPage = () => {
  const [activeTab, setActiveTab] = useState<'types' | 'policies' | 'calendar'>('types');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [leaveTypeForm, setLeaveTypeForm] = useState({
    code: '',
    name: '',
    categoryId: '',
    description: '',
    paid: true,
    deductible: true,
    requiresAttachment: false,
    minTenureMonths: 0,
    maxDurationDays: 0
  });

  const [policyForm, setPolicyForm] = useState({
    leaveTypeId: '',
    accrualMethod: 'monthly',
    monthlyRate: 0,
    yearlyRate: 0,
    carryForwardAllowed: false,
    maxCarryForward: 0,
    roundingRule: 'none',
    minNoticeDays: 0,
    maxConsecutiveDays: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'types') {
        const response = await fetch(`${API_URL}/leaves/types`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          setLeaveTypes(data.leaveTypes || []);
        }
      } else if (activeTab === 'policies') {
        // Fetch policies - placeholder
        // In production, add proper API endpoint
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeaveType = async () => {
    try {
      const response = await fetch(`${API_URL}/leaves/admin/types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(leaveTypeForm)
      });

      if (!response.ok) throw new Error('Failed to create leave type');

      alert('Leave type created successfully!');
      setShowModal(false);
      resetForms();
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to create leave type');
    }
  };

  const handleCreatePolicy = async () => {
    try {
      const response = await fetch(`${API_URL}/leaves/admin/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(policyForm)
      });

      if (!response.ok) throw new Error('Failed to create policy');

      alert('Leave policy created successfully!');
      setShowModal(false);
      resetForms();
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to create policy');
    }
  };

  const resetForms = () => {
    setLeaveTypeForm({
      code: '',
      name: '',
      categoryId: '',
      description: '',
      paid: true,
      deductible: true,
      requiresAttachment: false,
      minTenureMonths: 0,
      maxDurationDays: 0
    });
    setPolicyForm({
      leaveTypeId: '',
      accrualMethod: 'monthly',
      monthlyRate: 0,
      yearlyRate: 0,
      carryForwardAllowed: false,
      maxCarryForward: 0,
      roundingRule: 'none',
      minNoticeDays: 0,
      maxConsecutiveDays: 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Leave Policy Configuration</h1>
            <p className="text-gray-500 mt-1">Manage leave types, policies, and organizational calendar</p>
          </div>
          <button
            onClick={() => {
              setModalType('create');
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
          >
            <Plus size={20} />
            Add New
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('types')}
                className={`px-6 py-4 font-medium transition flex items-center gap-2 ${
                  activeTab === 'types'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={18} />
                Leave Types
              </button>
              <button
                onClick={() => setActiveTab('policies')}
                className={`px-6 py-4 font-medium transition flex items-center gap-2 ${
                  activeTab === 'policies'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings size={18} />
                Leave Policies
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-6 py-4 font-medium transition flex items-center gap-2 ${
                  activeTab === 'calendar'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar size={18} />
                Calendar Setup
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : activeTab === 'types' ? (
              <LeaveTypesTab types={leaveTypes} />
            ) : activeTab === 'policies' ? (
              <LeavePoliciesTab policies={leavePolicies} />
            ) : (
              <CalendarTab />
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {modalType === 'create' ? 'Create' : 'Edit'} {activeTab === 'types' ? 'Leave Type' : 'Leave Policy'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'types' ? (
                <LeaveTypeForm
                  form={leaveTypeForm}
                  setForm={setLeaveTypeForm}
                  onSubmit={handleCreateLeaveType}
                  onCancel={() => setShowModal(false)}
                />
              ) : (
                <LeavePolicyForm
                  form={policyForm}
                  setForm={setPolicyForm}
                  leaveTypes={leaveTypes}
                  onSubmit={handleCreatePolicy}
                  onCancel={() => setShowModal(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LeaveTypesTab = ({ types }: { types: LeaveType[] }) => {
  if (types.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg text-gray-500">No leave types configured</p>
        <p className="text-sm text-gray-400 mt-2">Click "Add New" to create your first leave type</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {types.map((type) => (
        <div key={type._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{type.name}</h3>
              <p className="text-sm text-gray-500">{type.code}</p>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 hover:text-blue-800 p-1">
                <Edit2 size={16} />
              </button>
              <button className="text-red-600 hover:text-red-800 p-1">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {type.description && (
            <p className="text-sm text-gray-600 mb-4">{type.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Paid</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                type.paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {type.paid ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Deductible</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                type.deductible ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {type.deductible ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Requires Attachment</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                type.requiresAttachment ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {type.requiresAttachment ? 'Yes' : 'No'}
              </span>
            </div>
            {type.minTenureMonths && type.minTenureMonths > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Min Tenure</span>
                <span className="font-semibold">{type.minTenureMonths} months</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const LeavePoliciesTab = ({ policies }: { policies: LeavePolicy[] }) => {
  return (
    <div className="text-center py-12">
      <Settings size={48} className="mx-auto text-gray-400 mb-4" />
      <p className="text-lg text-gray-500">Leave policies configuration</p>
      <p className="text-sm text-gray-400 mt-2">Configure accrual rules, carry forward, and entitlement policies</p>
    </div>
  );
};

const CalendarTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle size={20} />
          Calendar Configuration
        </h3>
        <p className="text-sm text-blue-800">
          Configure organizational holidays, blocked periods, and working days for accurate leave calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Public Holidays</h3>
          <p className="text-sm text-gray-500 mb-4">Add national and company holidays that won't count as leave days</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Add Holiday
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Blocked Periods</h3>
          <p className="text-sm text-gray-500 mb-4">Define periods when leave requests cannot be submitted</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Add Blocked Period
          </button>
        </div>
      </div>
    </div>
  );
};

const LeaveTypeForm = ({ form, setForm, onSubmit, onCancel }: any) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="AL"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Annual Leave"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Describe this leave type..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.paid}
            onChange={(e) => setForm({ ...form, paid: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-gray-700">Paid Leave</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.deductible}
            onChange={(e) => setForm({ ...form, deductible: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-gray-700">Deductible</label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.requiresAttachment}
          onChange={(e) => setForm({ ...form, requiresAttachment: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="text-sm font-medium text-gray-700">Requires Attachment</label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create Leave Type
        </button>
      </div>
    </div>
  );
};

const LeavePolicyForm = ({ form, setForm, leaveTypes, onSubmit, onCancel }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
        <select
          value={form.leaveTypeId}
          onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select leave type</option>
          {leaveTypes.map((type: LeaveType) => (
            <option key={type._id} value={type._id}>
              {type.name} ({type.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Accrual Method *</label>
        <select
          value={form.accrualMethod}
          onChange={(e) => setForm({ ...form, accrualMethod: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="per-term">Per Term</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rate</label>
          <input
            type="number"
            step="0.1"
            value={form.monthlyRate}
            onChange={(e) => setForm({ ...form, monthlyRate: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Rate</label>
          <input
            type="number"
            step="0.1"
            value={form.yearlyRate}
            onChange={(e) => setForm({ ...form, yearlyRate: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.carryForwardAllowed}
          onChange={(e) => setForm({ ...form, carryForwardAllowed: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="text-sm font-medium text-gray-700">Allow Carry Forward</label>
      </div>

      {form.carryForwardAllowed && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Carry Forward (days)</label>
          <input
            type="number"
            value={form.maxCarryForward}
            onChange={(e) => setForm({ ...form, maxCarryForward: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create Policy
        </button>
      </div>
    </div>
  );
};

export default LeavePolicyConfigPage;