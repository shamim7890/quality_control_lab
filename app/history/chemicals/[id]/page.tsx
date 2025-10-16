// app/history/chemicals/[id]/page.tsx
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import RequisitionDetails from '@/components/RequisitionDetails';
import RequisitionHistory from '@/components/RequisitionHistory';
import RequisitionDetailsHeader from '@/components/RequisitionDetailsHeader';
import { RequisitionWithItems } from '@/types/chemicals';

export const dynamic = 'force-dynamic';

async function getRequisitionDetails(id: number): Promise<RequisitionWithItems | null> {
  try {
    // Await cookies before using it
    const cookieStore = await cookies();
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/history/chemicals/${id}/history`,
      {
        headers: {
          cookie: cookieStore.toString(),
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Error fetching details:', response.statusText);
      return null;
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Failed to fetch requisition details:', error);
    return null;
  }
}

export default async function RequisitionDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  // Await params before accessing properties
  const { id: paramId } = await params;
  const id = parseInt(paramId, 10);
  
  if (isNaN(id)) notFound();

  const requisition = await getRequisitionDetails(id);
  if (!requisition) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <RequisitionDetailsHeader 
        requisitionNumber={requisition.requisition_number}
        requisitionId={id}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Requisition Details Section */}
          <RequisitionDetails requisition={requisition} />

          {/* History Section */}
          <RequisitionHistory requisitionId={id} />
        </div>
      </div>
    </div>
  );
}