"use client"
import React, { useState } from 'react';
import { Plus, Download, Eye, Trash2, FileText, X, Calendar, DollarSign, Users } from 'lucide-react';

const BankFilesPage = () => {
  const [bankFiles, setBankFiles] = useState<any[]>([
    {
      _id: '1',
      fileName: 'Payroll_Jan2025_ABC_Bank.csv',
      runPeriod: '2025-01-01',
      createdDate: '2025-01-15T10:00:00Z',
      totalAmount: 250000,
      employeeCount: 45,
      status: 'generated',
      format: 'CSV',
      bankName: 'ABC Bank'
    },
    {
      _id: '2',
      fileName: 'Payroll_Jan2025_XYZ_Bank.txt',
      runPeriod: '2025-01-01',
      createdDate: '2025-01-15T10:30:00Z',
      totalAmount: 180000,
      employeeCount: 32,
      status: 'sent',
      format: 'TXT',
      bankName: 'XYZ Bank'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [createForm, setCreateForm] = useState({
    runId: '',
    format: 'CSV',
    bankName: ''
  });

  const handleCreateFile = () => {
    if (!createForm.runId || !createForm.format || !createForm.bankName) {
      alert('Please fill in all fields');
      return;
    }

    const newFile = {
      _id: Date.now().toString(),
      fileName: `Payroll_${createForm.runId}_${createForm.bankName}.${createForm.format.toLowerCase()}`,
      runPeriod: '2025-01-01',
      createdDate: new Date().toISOString(),
      totalAmount: Math.floor(Math.random() * 300000) + 100000,
      employeeCount: Math.floor(Math.random() * 50) + 20,
      status: 'generated',
      format: createForm.format,
      bankName: createForm.bankName
    };

    setBankFiles([newFile, ...bankFiles]);
    setShowCreateModal(false);
    setCreateForm({ runId: '', format: 'CSV', bankName: '' });
    alert('Bank file generated successfully!');
  };

  const handleDownload = (fileId: string, fileName: string) => {
    alert(`Downloading ${fileName}`);
  };

  const handleDelete = (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this bank file?')) {
      setBankFiles(bankFiles.filter(f => f._id !== fileId));
      alert('Bank file deleted successfully');
    }
  };

  const handleViewDetails = (file: any) => {
    setSelectedFile(file);
    setShowPreviewModal(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      'generated': 'bg-blue-200 text-blue-800',
      'sent': 'bg-green-200 text-green-800',
      'failed': 'bg-red-200 text-red-800'
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Bank Files</h1>
            <p className="text-gray-500 mt-1">Generate and manage bank transfer files</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
          >
            <Plus size={20} />
            Generate New Bank File
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Files</p>
                <p className="text-3xl font-bold text-gray-800">{bankFiles.length}</p>
              </div>
              <FileText size={40} className="text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-green-600">
                  ${bankFiles.reduce((sum, f) => sum + f.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign size={40} className="text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-purple-600">
                  {bankFiles.reduce((sum, f) => sum + f.employeeCount, 0)}
                </p>
              </div>
              <Users size={40} className="text-purple-500" />
            </div>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bankFiles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">No bank files generated yet</p>
                      <p className="text-sm mt-2">Click the button above to generate your first bank file</p>
                    </td>
                  </tr>
                ) : (
                  bankFiles.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{file.fileName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{file.bankName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {new Date(file.runPeriod).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(file.createdDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ${file.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{file.employeeCount}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {file.format}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(file.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(file)}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownload(file._id, file.fileName)}
                            className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(file._id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Bank File Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Generate Bank File</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payroll Run ID
                </label>
                <input
                  type="text"
                  value={createForm.runId}
                  onChange={(e) => setCreateForm({ ...createForm, runId: e.target.value })}
                  placeholder="PR-2025-1234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={createForm.bankName}
                  onChange={(e) => setCreateForm({ ...createForm, bankName: e.target.value })}
                  placeholder="ABC Bank"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Format
                </label>
                <select
                  value={createForm.format}
                  onChange={(e) => setCreateForm({ ...createForm, format: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CSV">CSV</option>
                  <option value="TXT">TXT</option>
                  <option value="XML">XML</option>
                  <option value="JSON">JSON</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Generate File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreviewModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">File Details</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">File Name</p>
                  <p className="font-semibold">{selectedFile.fileName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bank Name</p>
                  <p className="font-semibold">{selectedFile.bankName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Format</p>
                  <p className="font-semibold">{selectedFile.format}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  {getStatusBadge(selectedFile.status)}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="font-semibold text-green-600">${selectedFile.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Employee Count</p>
                  <p className="font-semibold">{selectedFile.employeeCount}</p>
                </div>
              </div>

              {/* File Content Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-3">File Content Preview</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>
{`Employee ID,Name,Account Number,Amount
EMP001,Ahmed Hassan,1234567890,12000.00
EMP002,Fatima Ali,0987654321,9600.00
EMP003,Mohamed Ibrahim,1122334455,15000.00
...
Total Records: ${selectedFile.employeeCount}
Total Amount: ${selectedFile.totalAmount.toLocaleString()}`}
                  </pre>
                </div>
              </div>

              {/* Employee List */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Included Employees ({selectedFile.employeeCount})</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Employee ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2">EMP001</td>
                        <td className="px-4 py-2">Ahmed Hassan</td>
                        <td className="px-4 py-2">Engineering</td>
                        <td className="px-4 py-2 text-right font-semibold">$12,000.00</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2">EMP002</td>
                        <td className="px-4 py-2">Fatima Ali</td>
                        <td className="px-4 py-2">Sales</td>
                        <td className="px-4 py-2 text-right font-semibold">$9,600.00</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2">EMP003</td>
                        <td className="px-4 py-2">Mohamed Ibrahim</td>
                        <td className="px-4 py-2">Marketing</td>
                        <td className="px-4 py-2 text-right font-semibold">$15,000.00</td>
                      </tr>
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                        <td className="px-4 py-2 text-right text-green-600">${selectedFile.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleDownload(selectedFile._id, selectedFile.fileName)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download File
                </button>
                <button
                  onClick={() => handleDelete(selectedFile._id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankFilesPage;