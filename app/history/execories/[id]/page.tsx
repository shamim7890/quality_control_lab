// app/history/execories/[id]/page.tsx
import { notFound } from 'next/navigation';
import AdminRequisitionDetails from '@/components/AdminRequisitionDetails';
import AdminRequisitionHistory from '@/components/AdminRequisitionHistory';
import AdminRequisitionDetailsHeader from '@/components/AdminRequisitionDetailsHeader';
import { AdminRequisitionWithItems } from '@/types/admin-items';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface AdminItemJoin {
  item_name: string;
  quantity: number;
  unit: string;
}

interface AdminRequisitionItemWithItem {
  id: number;
  requisition_id: number;
  admin_item_id: number;
  requested_quantity: number;
  approved_quantity: number;
  unit: string;
  remark: string;
  is_processed: boolean;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  admin_items: AdminItemJoin;
}

async function getRequisitionDetails(id: number): Promise<AdminRequisitionWithItems | null> {
  try {
    const { data: requisition, error: reqError } = await supabase
      .from('admin_item_requisitions')
      .select('*')
      .eq('id', id)
      .single();

    if (reqError || !requisition) {
      console.error('Error fetching requisition:', reqError);
      return null;
    }

    const { data: items, error: itemsError } = await supabase
      .from('admin_item_requisition_items')
      .select(`
        *,
        admin_items (
          item_name,
          quantity,
          unit
        )
      `)
      .eq('requisition_id', id);

    if (itemsError) {
      console.error('Error fetching requisition items:', itemsError);
      return null;
    }

    const typedItems = items as unknown as AdminRequisitionItemWithItem[];

    const requisitionWithItems: AdminRequisitionWithItems = {
      ...requisition,
      items: typedItems?.map((item) => ({
        id: item.id,
        requisition_id: item.requisition_id,
        admin_item_id: item.admin_item_id,
        requested_quantity: item.requested_quantity,
        approved_quantity: item.approved_quantity,
        unit: item.admin_items?.unit || item.unit || '',
        remark: item.remark,
        is_processed: item.is_processed,
        processed_at: item.processed_at,
        item_name: item.admin_items?.item_name || 'Unknown',
        quantity: item.admin_items?.quantity || 0,
      })) || [],
    };

    return requisitionWithItems;
  } catch (error) {
    console.error('Failed to fetch requisition details:', error);
    return null;
  }
}

export default async function AdminRequisitionDetailsPage({ 
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
      <AdminRequisitionDetailsHeader 
        requisitionNumber={requisition.requisition_number}
        requisitionId={id}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Requisition Details Section */}
          <AdminRequisitionDetails requisition={requisition} />

          {/* History Section */}
          <AdminRequisitionHistory requisitionId={id} />
        </div>
      </div>
    </div>
  );
}