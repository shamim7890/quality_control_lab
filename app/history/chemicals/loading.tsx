// app/history/chemicals/loading.tsx
import { StatsSkeleton, TableSkeleton } from '@/components/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-96"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <StatsSkeleton />
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 h-12 bg-gray-100 rounded-lg"></div>
                <div className="w-48 h-12 bg-gray-100 rounded-lg"></div>
              </div>
            </div>
          </div>

          <TableSkeleton />
        </div>
      </div>
    </div>
  );
}
