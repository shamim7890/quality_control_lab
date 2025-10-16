// components/RequisitionHistory.tsx
'use client';

import { useState, useEffect } from 'react';
import { RequisitionHistoryItem, ApiResponse } from '@/types/chemicals';

interface Props {
  requisitionId: number;
}

function getActionIcon(action: string): string {
  const actionMap: Record<string, string> = {
    created: 'M12 4v16m8-8H4',
    admin_approved: 'M5 13l4 4L19 7',
    moderator_approved: 'M5 13l4 4L19 7',
    rejected: 'M6 18L18 6M6 6l12 12',
    cancelled: 'M6 18L18 6M6 6l12 12',
    inventory_deducted: 'M20 12H4m16 0l-4-4m4 4l-4 4',
    requisition_deduction: 'M20 12H4m16 0l-4-4m4 4l-4 4',
  };
  return actionMap[action] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
}

function getActionColor(action: string): string {
  const colorMap: Record<string, string> = {
    created: 'bg-blue-100 text-blue-800 border-blue-200',
    admin_approved: 'bg-green-100 text-green-800 border-green-200',
    moderator_approved: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    inventory_deducted: 'bg-orange-100 text-orange-800 border-orange-200',
    requisition_deduction: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return colorMap[action] || 'bg-gray-100 text-gray-800 border-gray-200';
}

function formatActionLabel(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

export default function RequisitionHistory({ requisitionId }: Props) {
  const [history, setHistory] = useState<RequisitionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'audit' | 'transaction'>('all');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(`/api/history/chemicals/${requisitionId}/history`);
        if (!response.ok) throw new Error('Failed to fetch history');
        const result: ApiResponse<RequisitionHistoryItem> = await response.json();
        if (result.error) throw new Error(result.error);
        setHistory(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (requisitionId > 0) {
      fetchHistory();
    }
  }, [requisitionId]);

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-center text-gray-600 mt-3">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error Loading History</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Activity History</h3>
            <p className="text-sm text-gray-600 mt-1">
              Complete timeline of all actions and changes
            </p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilter('audit')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'audit'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Approvals ({history.filter(h => h.type === 'audit').length})
            </button>
            <button
              onClick={() => setFilter('transaction')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'transaction'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Transactions ({history.filter(h => h.type === 'transaction').length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No history available</h3>
          <p className="mt-2 text-sm text-gray-600">
            There are no {filter !== 'all' ? filter : ''} records for this requisition yet.
          </p>
        </div>
      ) : (
        <div className="p-6">
          {/* Timeline */}
          <div className="flow-root">
            <ul className="space-y-6">
              {filteredHistory.map((item, index) => (
                <li key={index} className="relative">
                  {/* Vertical line */}
                  {index !== filteredHistory.length - 1 && (
                    <div className="absolute left-4 top-12 -bottom-6 w-0.5 bg-gray-200"></div>
                  )}
                  
                  <div className="relative flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${getActionColor(item.action)}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getActionIcon(item.action)} />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {formatActionLabel(item.action)}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {formatDateTime(item.timestamp)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.type === 'audit' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.type === 'audit' ? 'Approval' : 'Transaction'}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          {/* Performed By */}
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-gray-700">
                              <span className="font-medium">{item.performed_by}</span>
                              {item.role && <span className="text-gray-500"> ({item.role})</span>}
                            </span>
                          </div>

                          {/* Status Change */}
                          {item.old_status && item.new_status && (
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="text-gray-700">
                                Status changed from{' '}
                                <span className="font-medium text-gray-900">{item.old_status.replace(/_/g, ' ')}</span>
                                {' '}to{' '}
                                <span className="font-medium text-gray-900">{item.new_status.replace(/_/g, ' ')}</span>
                              </span>
                            </div>
                          )}

                          {/* Transaction Details */}
                          {item.type === 'transaction' && (
                            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div>
                                  <p className="text-gray-500 mb-1">Quantity Change</p>
                                  <p className={`font-semibold ${
                                    Number(item.quantity_change) < 0 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {Number(item.quantity_change) > 0 ? '+' : ''}{Number(item.quantity_change).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Before</p>
                                  <p className="font-semibold text-gray-900">
                                    {Number(item.quantity_before).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">After</p>
                                  <p className="font-semibold text-gray-900">
                                    {Number(item.quantity_after).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              {item.reason && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-gray-500 text-xs mb-1">Reason</p>
                                  <p className="text-gray-700">{item.reason}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Additional Details */}
                          {item.details && Object.keys(item.details).length > 0 && (
                            <details className="mt-3">
                              <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700">
                                View additional details
                              </summary>
                              <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                                  {JSON.stringify(item.details, null, 2)}
                                </pre>
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}