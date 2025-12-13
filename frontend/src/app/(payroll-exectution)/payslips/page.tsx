"use client";
import React, { useState, useEffect } from 'react';
import { Search, Download, Send, Eye, Printer, Mail, X, FileText } from 'lucide-react';

const API_URL = 'http://localhost:3000';

const FinalizedPayslipsPage = () => {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    runId: '',
    employeeName: '',
    department: '',
    startDate: '',
    endDate: ''
  });
  const [selectedPayslips, setSelectedPayslips] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  useEffect(() => {
    fetchPayslips();
  }, [filters.department]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.runId) params.append('runId', filters.runId);
      if (filters.employeeName) params.append('employeeName', filters.employeeName);
      if (filters.department) params.append('department', filters.department);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await fetch(`${API_URL}/payroll-execution/payslips?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payslips');
      }
      
      const data = await response.json();
      setPayslips(data);
    } catch (err: any) {
      console.error('Error fetching payslips:', err);
      setError(err.message || 'Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPayslip = (id: string) => {
    setSelectedPayslips(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayslips.length === payslips.length) {
      setSelectedPayslips([]);
    } else {
      setSelectedPayslips(payslips.map(p => p._id));
    }
  };

  const handleViewDetail = async (payslip: any) => {
    try {
      // Fetch full payslip details
      const response = await fetch(`${API_URL}/payroll-execution/payslips/${payslip._id}`);
      if (!response.ok) throw new Error('Failed to fetch payslip details');
      
      const fullPayslip = await response.json();
      setSelectedPayslip({
        ...payslip,
        ...fullPayslip
      });
      setShowDetailModal(true);
    } catch (err: any) {
      console.error('Error fetching payslip details:', err);
      alert('Failed to load payslip details: ' + err.message);
    }
  };

  const handleDownload = async (payslipId: string) => {
    try {
      // TODO: Implement PDF download endpoint
      alert(`Downloading payslip ${payslipId}`);
    } catch (err: any) {
      alert('Failed to download payslip');
    }
  };

  const handleBulkDownload = () => {
    if (selectedPayslips.length === 0) {
      alert('Please select payslips first');
      return;
    }
    alert(`Downloading ${selectedPayslips.length} payslips`);
  };

  const handleBulkResend = async () => {
    if (selectedPayslips.length === 0) {
      alert('Please select payslips first');
      return;
    }
    
    try {
      const promises = selectedPayslips.map(id =>
        fetch(`${API_URL}/payroll-execution/payslips/${id}/resend`, {
          method: 'POST'
        })
      );
      
      await Promise.all(promises);
      alert(`Resent ${selectedPayslips.length} payslips successfully`);
      setSelectedPayslips([]);
    } catch (err: any) {
      alert('Failed to resend some payslips');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailPayslip = async (payslipId: string) => {
    try {
      const response = await fetch(`${API_URL}/payroll-execution/payslips/${payslipId}/resend`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to send email');
      
      alert('Payslip sent successfully');
    } catch (err: any) {
      alert('Failed to send payslip: ' + err.message);
    }
  };

  const filteredPayslips = payslips.filter(payslip => {
    const matchesEmployee = payslip.employeeName?.toLowerCase().includes(filters.employeeName.toLowerCase());
    const matchesDepartment = !filters.department || payslip.department === filters.department;
    return matchesEmployee && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Finalized Payslips</h1>
            <p className="text-gray-500 mt-1">View and manage all employee payslips</p>
          </div>
          {selectedPayslips.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleBulkDownload}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Download size={18} />
                Download Selected ({selectedPayslips.length})
              </button>
              <button
                onClick={handleBulkResend}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
              >
                <Send size={18} />
                Resend Selected
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Employee</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  value={filters.employeeName}
                  onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && fetchPayslips()}
                  placeholder="Employee name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchPayslips}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payslips...</p>
            </div>
          ) : filteredPayslips.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No payslips found</p>
              <p className="text-sm mt-2">Try adjusting your filters or generate payslips first</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPayslips.length === filteredPayslips.length && filteredPayslips.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayslips.map((payslip) => (
                    <tr key={payslip._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPayslips.includes(payslip._id)}
                          onChange={() => handleSelectPayslip(payslip._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{payslip.employeeName}</div>
                        <div className="text-xs text-gray-500">{payslip.employeeCode}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{payslip.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payslip.runPeriod).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${payslip.grossSalary?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        -${payslip.deductions?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ${payslip.netPay?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payslip.status === 'paid' ? 'bg-green-200 text-green-800' :
                          payslip.status === 'distributed' ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {payslip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetail(payslip)}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownload(payslip._id)}
                            className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleEmailPayslip(payslip._id)}
                            className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded"
                            title="Resend Email"
                          >
                            <Send size={18} />
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

      {/* Payslip Detail Modal */}
      {showDetailModal && selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payslip Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Company Header */}
              <div className="text-center border-b pb-4">
                <h3 className="text-xl font-bold text-gray-800">Company Name</h3>
                <p className="text-sm text-gray-500">123 Business St, City, Country</p>
                <p className="text-sm text-gray-500">Tel: +123 456 7890</p>
              </div>

              {/* Employee Details */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Employee Name</p>
                  <p className="font-semibold">{selectedPayslip.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Employee Code</p>
                  <p className="font-semibold">{selectedPayslip.employeeCode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-semibold">{selectedPayslip.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pay Period</p>
                  <p className="font-semibold">
                    {new Date(selectedPayslip.runPeriod).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div>
                <h4 className="font-semibold text-lg mb-3 text-green-700">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Base Salary</span>
                    <span className="font-semibold">${selectedPayslip.earnings?.baseSalary?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Allowances</span>
                    <span className="font-semibold">${selectedPayslip.earnings?.allowances?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Bonuses</span>
                    <span className="font-semibold">${selectedPayslip.earnings?.bonuses?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Benefits</span>
                    <span className="font-semibold">${selectedPayslip.earnings?.benefits?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg">
                    <span>Total Gross</span>
                    <span className="text-green-600">${selectedPayslip.grossSalary?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div>
                <h4 className="font-semibold text-lg mb-3 text-red-700">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-semibold text-red-600">-${selectedPayslip.deductionsBreakdown?.taxes?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Insurance</span>
                    <span className="font-semibold text-red-600">-${selectedPayslip.deductionsBreakdown?.insurance?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Penalties</span>
                    <span className="font-semibold text-red-600">-${selectedPayslip.deductionsBreakdown?.penalties?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg">
                    <span>Total Deductions</span>
                    <span className="text-red-600">-${selectedPayslip.deductions?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Net Pay</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ${selectedPayslip.netPay?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Print
                </button>
                <button
                  onClick={() => handleDownload(selectedPayslip._id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button
                  onClick={() => handleEmailPayslip(selectedPayslip._id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalizedPayslipsPage;