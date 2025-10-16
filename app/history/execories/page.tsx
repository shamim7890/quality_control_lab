// app/history/execories/page.tsx
import Link from 'next/link';
import AdminRequisitionsList from '@/components/AdminRequisitionsList';
import { AdminRequisition } from '@/types/admin-items';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getRequisitions(): Promise<AdminRequisition[]> {
  try {
    const { data, error } = await supabase
      .from('admin_item_requisitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching requisitions:', error);
      return [];
    }

    return (data as AdminRequisition[]) || [];
  } catch (error) {
    console.error('Failed to fetch requisitions:', error);
    return [];
  }
}

export default async function AdminRequisitionsPage() {
  const requisitions = await getRequisitions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Execories Item Requisitions</h1>
              <p className="text-gray-600 mt-2">
                View and manage all execories item requisition requests
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/requisitions/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Requisition
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <AdminRequisitionsList initialRequisitions={requisitions} />
      </div>
    </div>
  );
}