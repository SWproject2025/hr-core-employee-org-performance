"use client";
import React, { useState } from 'react';
import { LayoutDashboard, Settings, Play, User, TrendingUp, FileText, Calendar, CheckSquare, ClipboardList, DollarSign, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SubMenuItem {
  id: string;
  label: string;
  path: string;
  roles?: string[];
}

interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  path?: string;
  roles?: string[];
  submenu?: SubMenuItem[];
}

export const Sidebar = () => {
    const [activeItem, setActiveItem] = React.useState('dashboard');
    const router = useRouter();
    const { hasRole, isAuthenticated } = useAuth();

    // Helper function to check if menu item should be shown
    const shouldShow = (requiredRoles?: string[]) => {
      if (!isAuthenticated) return false;
      if (!requiredRoles || requiredRoles.length === 0) return true;
      return requiredRoles.some(role => hasRole(role));
    };

    const menuItems: MenuItem[] = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { 
        id: 'payroll-config', 
        icon: Settings, 
        label: 'Payroll Config',
        submenu: [
          { id: 'policies', label: 'Policies', path: '/payroll-config/policies' },
          { id: 'pay-grades', label: 'Pay Grades', path: '/payroll-config/pay-grades' },
          { id: 'pay-types', label: 'Pay Types', path: '/payroll-config/pay-types' },
          { id: 'overtime-rules', label: 'Overtime Rules', path: '/payroll-config/overtime-rules' },
          { id: 'shift-differentials', label: 'Shift Differentials', path: '/payroll-config/shift-differentials' },
          { id: 'allowances', label: 'Allowances', path: '/payroll-config/allowances' },
          { id: 'multi-currency', label: 'Multi-Currency', path: '/payroll-config/multi-currency' },
          { id: 'integrations', label: 'Integrations', path: '/payroll-config/integrations' }
        ]
      },
      {
        id: 'payroll-runs',
        icon: Play,
        label: 'Payroll Runs',
        submenu: [
          { id: 'all-runs', label: 'All Runs', path: '/runs' },
          { id: 'finalized-payslips', label: 'Finalized Payslips', path: '/payslips' },
          { id: 'exceptions', label: 'Exceptions', path: '/exceptions' },
          { id: 'bank-files', label: 'Bank Files', path: '/bank-files' }
        ]
      },
      {
        id: 'leave-management',
        icon: Calendar,
        label: 'Leave Management',
        submenu: [
          { id: 'my-leaves', label: 'My Leave Requests', path: '/leaves/my-leaves' },
          { id: 'leave-approvals', label: 'Leave Approvals', path: '/leaves/approvals' },
          { id: 'leave-balance', label: 'Leave Balance', path: '/leaves/my-leaves' },
          { id: 'leave-config', label: 'Leave Configuration', path: '/leaves/config' }
        ]
      },
      {
      id: 'payroll-tracking',
      icon: DollarSign,
      label: 'Payroll Tracking',
      roles: ['department employee', 'Payroll Specialist', 'Payroll Manager', 'Finance Staff'],
      submenu: [
        // Employee menu items
        {
          id: 'my-payslips',
          label: 'My Payslips',
          path: '/payroll-tracking/payslips',
          roles: ['department employee']
        },
        {
          id: 'my-salary-details',
          label: 'Salary Details',
          path: '/payroll-tracking/salary-details',
          roles: ['department employee']
        },
        {
          id: 'my-disputes',
          label: 'My Disputes',
          path: '/payroll-tracking/disputes',
          roles: ['department employee']
        },
        {
          id: 'my-claims',
          label: 'My Claims',
          path: '/payroll-tracking/claims',
          roles: ['department employee']
        },
        {
          id: 'tax-documents',
          label: 'Tax Documents',
          path: '/payroll-tracking/tax-documents',
          roles: ['department employee']
        },
        // Specialist menu items
        {
          id: 'review-disputes',
          label: 'Review Disputes',
          path: '/payroll-tracking/specialist/disputes',
          roles: ['Payroll Specialist']
        },
        {
          id: 'review-claims',
          label: 'Review Claims',
          path: '/payroll-tracking/specialist/claims',
          roles: ['Payroll Specialist']
        },
        {
          id: 'department-reports',
          label: 'Department Reports',
          path: '/payroll-tracking/specialist/reports',
          roles: ['Payroll Specialist']
        },
        // Manager menu items
        {
          id: 'manager-approvals',
          label: 'Pending Approvals',
          path: '/payroll-tracking/manager/approvals',
          roles: ['Payroll Manager']
        },
        // Finance menu items
        {
          id: 'approved-disputes',
          label: 'Approved Disputes',
          path: '/payroll-tracking/finance/disputes',
          roles: ['Finance Staff']
        },
        {
          id: 'approved-claims',
          label: 'Approved Claims',
          path: '/payroll-tracking/finance/claims',
          roles: ['Finance Staff']
        },
        {
          id: 'finance-reports',
          label: 'Financial Reports',
          path: '/payroll-tracking/finance/reports',
          roles: ['Finance Staff']
        },
      ]
    },
    ].filter(item => shouldShow(item.roles));
  

    function handleClick (id : string, path: string) 
    {
      setActiveItem(id)
      router.push(path)
    }  

 return (
    <div className="w-60 bg-slate-900 text-white h-screen flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <span className="font-semibold text-sm">HR System</span>
      </div>

      <nav className="flex-1 py-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const filteredSubmenu = item.submenu?.filter(subItem =>
            shouldShow(subItem.roles || item.roles)
          ) || [];

          // Don't show parent item if it has submenu but no visible submenu items
          if (item.submenu && filteredSubmenu.length === 0) {
            return null;
          }

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (!item.submenu && item.path) {
                    handleClick(item.id, item.path);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors ${activeItem === item.id && !item.submenu ? 'bg-blue-600' : ''
                  }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>

              {filteredSubmenu.length > 0 && (
                <div>
                  {filteredSubmenu.map(subItem => (
                    <button
                      key={subItem.id}
                      onClick={() => handleClick(subItem.id, subItem.path)}
                      className={`w-full flex items-center gap-3 px-4 pl-10 py-2 text-sm hover:bg-slate-800 transition-colors ${activeItem === subItem.id ? 'bg-blue-600' : ''
                        }`}
                    >
                      <FileText size={14} />
                      <span className="text-left">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};