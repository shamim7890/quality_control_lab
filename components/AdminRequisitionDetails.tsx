// components/AdminRequisitionDetails.tsx
'use client';

import { AdminRequisition, AdminRequisitionItem, AdminRequisitionWithItems } from '@/types/admin-items';

interface Props {
  requisition: AdminRequisitionWithItems;
}

export function getStatusBadge(status: AdminRequisition['status']): { color: string; label: string; icon: string } {
  const statusMap: Record<AdminRequisition['status'], { color: string; label: string; icon: string }> = {
    pending: { 
      color: 'bg-amber-100 text-amber-800 border-amber-200', 
      label: 'Pending Approval',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    approved_by_technical_manager_c: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      label: 'Approved by Technical Manager C',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    approved_by_technical_manager_m: { 
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
      label: 'Approved by Technical Manager M',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    approved_by_senior_assistant_director: { 
      color: 'bg-purple-100 text-purple-800 border-purple-200', 
      label: 'Approved by Senior Assistant Director',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    approved: { 
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
      label: 'Fully Approved',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    rejected: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      label: 'Rejected',
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    cancelled: { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      label: 'Cancelled',
      icon: 'M6 18L18 6M6 6l12 12'
    },
  };
  return statusMap[status] || { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    label: 'Unknown',
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function AdminRequisitionDetails({ requisition }: Props) {
  const statusInfo = getStatusBadge(requisition.status);
  
  const totalRequested = requisition.items.reduce((sum, item) => sum + Number(item.requested_quantity), 0);
  const totalApproved = requisition.items.reduce((sum, item) => sum + Number(item.approved_quantity), 0);
  const processedItems = requisition.items.filter(item => item.is_processed).length;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`rounded-lg border-2 p-6 ${statusInfo.color}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusInfo.icon} />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{requisition.requisition_number}</h2>
              <p className="text-sm font-medium mt-1">{statusInfo.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Created on</p>
            <p className="text-lg font-semibold">{formatDate(requisition.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Key Information Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Requisition Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Department</p>
            <p className="text-lg font-semibold text-gray-900">{requisition.department}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Requester</p>
            <p className="text-lg font-semibold text-gray-900">{requisition.requester}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Requisition Date</p>
            <p className="text-lg font-semibold text-gray-900">{formatDate(requisition.requisition_date)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Items</p>
            <p className="text-lg font-semibold text-gray-900">{requisition.total_items}</p>
          </div>
        </div>
      </div>

      {/* Approval Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Timeline</h3>
        <div className="space-y-4">
          {requisition.status === 'rejected' && requisition.rejected_by && (
            <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-xs text-red-600">{requisition.rejection_reason}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">by {requisition.rejected_by} ({requisition.rejected_by_role})</p>
                <p className="text-xs text-gray-500">{formatDateTime(requisition.rejected_at!)}</p>
              </div>
            </div>
          )}
          {requisition.quality_assurance_manager_approved_by && (
            <div className="flex items-center space-x-4 p-3 bg-emerald-50 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">Approved by Quality Assurance Manager</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">by {requisition.quality_assurance_manager_approved_by}</p>
                <p className="text-xs text-gray-500">{formatDateTime(requisition.quality_assurance_manager_approved_at!)}</p>
              </div>
            </div>
          )}
          {requisition.senior_assistant_director_approved_by && (
            <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-800">Approved by Senior Assistant Director</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">by {requisition.senior_assistant_director_approved_by}</p>
                <p className="text-xs text-gray-500">{formatDateTime(requisition.senior_assistant_director_approved_at!)}</p>
              </div>
            </div>
          )}
          {requisition.technical_manager_m_approved_by && (
            <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-800">Approved by Technical Manager M</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">by {requisition.technical_manager_m_approved_by}</p>
                <p className="text-xs text-gray-500">{formatDateTime(requisition.technical_manager_m_approved_at!)}</p>
              </div>
            </div>
          )}
          {requisition.technical_manager_c_approved_by && (
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Approved by Technical Manager C</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">by {requisition.technical_manager_c_approved_by}</p>
                <p className="text-xs text-gray-500">{formatDateTime(requisition.technical_manager_c_approved_at!)}</p>
              </div>
            </div>
          )}
          {requisition.status === 'pending' && (
            <div className="flex items-center space-x-4 p-3 bg-amber-50 rounded-lg">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Pending Approval</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{formatDateTime(requisition.created_at)}</p>
              </div>
            </div>
          )}
          {requisition.completed_at && (
            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Completed</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{formatDateTime(requisition.completed_at)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Requested Items</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total Requested: {totalRequested} | Total Approved: {totalApproved} | Processed: {processedItems}/{requisition.items.length}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requisition.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.requested_quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.approved_quantity === item.requested_quantity 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.approved_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={item.remark || 'No remark'}>
                      {item.remark || 'No remark'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.is_processed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.is_processed ? 'Processed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}