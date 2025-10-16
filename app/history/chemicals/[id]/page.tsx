// app/history/chemicals/[id]/page.tsx
import { notFound } from 'next/navigation';
import RequisitionDetails from '@/components/RequisitionDetails';
import RequisitionHistory from '@/components/RequisitionHistory';
import RequisitionDetailsHeader from '@/components/RequisitionDetailsHeader';
import { RequisitionWithItems } from '@/types/chemicals';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface ChemicalItemJoin {
  chemical_name: string;
  quantity: number;
  unit: string;
}

interface RequisitionItemWithChemical {
  id: number;
  requisition_id: number;
  chemical_item_id: number;
  requested_quantity: number;
  approved_quantity: number;
  unit: string;
  expiry_date: string;
  remark: string;
  is_processed: boolean;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  chemical_items: ChemicalItemJoin;
}

async function getRequisitionDetails(id: number): Promise<RequisitionWithItems | null> {
  try {
    const { data: requisition, error: reqError } = await supabase
      .from('requisitions')
      .select('*')
      .eq('id', id)
      .single();

    if (reqError || !requisition) {
      console.error('Error fetching requisition:', reqError);
      return null;
    }

    const { data: items, error: itemsError } = await supabase
      .from('requisition_items')
      .select(`
        *,
        chemical_items (
          chemical_name,
          quantity,
          unit
        )
      `)
      .eq('requisition_id', id);

    if (itemsError) {
      console.error('Error fetching requisition items:', itemsError);
      return null;
    }

    const typedItems = items as unknown as RequisitionItemWithChemical[];

    const requisitionWithItems: RequisitionWithItems = {
      ...requisition,
      items: typedItems?.map((item) => ({
        id: item.id,
        requisition_id: item.requisition_id,
        chemical_item_id: item.chemical_item_id,
        requested_quantity: item.requested_quantity,
        approved_quantity: item.approved_quantity,
        unit: item.chemical_items?.unit || item.unit || '',
        expiry_date: item.expiry_date,
        remark: item.remark,
        is_processed: item.is_processed,
        processed_at: item.processed_at,
        chemical_name: item.chemical_items?.chemical_name || 'Unknown',
        quantity: item.chemical_items?.quantity || 0,
      })) || [],
    };

    return requisitionWithItems;
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