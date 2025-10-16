// components/AdminRequisitionHistory.tsx (Placeholder - adapt from previous if available)
'use client';

import { useState, useEffect } from 'react';
import { AdminRequisitionHistoryItem } from '@/types/admin-items';

interface Props {
  requisitionId: number;
}

export default function AdminRequisitionHistory({ requisitionId }: Props) {
  const [history, setHistory] = useState<AdminRequisitionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/history/execories/${requisitionId}/history`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [requisitionId]);

  if (loading) return <div>Loading history...</div>;
  if (history.length === 0) return <div>No history available.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {history.map((item, idx) => (
          <div key={idx} className="px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.action}</p>
                <p className="text-xs text-gray-500">by {item.performed_by} ({item.role || 'N/A'})</p>
                {item.type === 'audit' && item.old_status && item.new_status && (
                  <p className="text-xs text-gray-500">Status: {item.old_status} → {item.new_status}</p>
                )}
                {item.type === 'transaction' && (
                  <p className="text-xs text-gray-500">Quantity: {item.quantity_before} → {item.quantity_after} ({(item.quantity_change ?? 0) > 0 ? '+' : ''}{item.quantity_change ?? 0})</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}