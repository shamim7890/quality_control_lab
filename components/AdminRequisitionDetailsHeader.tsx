import Link from 'next/link';
interface HeaderProps {
  requisitionNumber: string;
  requisitionId: number;
}

export default function AdminRequisitionDetailsHeader({ requisitionNumber, requisitionId }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center space-x-4">
          <Link href="/history/admin-items" className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{requisitionNumber}</h1>
            <p className="text-sm text-gray-500">Requisition #{requisitionId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}