'use client';

import { useState } from 'react';
import { EmployeeProfile, UpdateContactDto } from '@/types/employee';
import { EmployeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';

export const ContactForm = ({ profile }: { profile: EmployeeProfile }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UpdateContactDto>({
    mobilePhone: profile.mobilePhone || '',
    personalEmail: profile.personalEmail || '',
    address: {
      streetAddress: profile.address?.streetAddress || '',
      city: profile.address?.city || '',
      country: profile.address?.country || '',
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await EmployeeService.updateContact(profile._id, form);
      toast.success("Contact info updated successfully!");
    } catch (error) {
      toast.error("Failed to update contact info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={form.mobilePhone}
            onChange={(e) => setForm({ ...form, mobilePhone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Personal Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={form.personalEmail}
            onChange={(e) => setForm({ ...form, personalEmail: e.target.value })}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={form.address?.streetAddress}
              onChange={(e) => setForm({ ...form, address: { ...form.address, streetAddress: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={form.address?.city}
              onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={form.address?.country}
              onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};