// app/api/history/admin-items/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AdminRequisitionWithItems } from '@/types/admin-items';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params before accessing properties
  const { id } = await params;
  const requisitionId = parseInt(id, 10);

  if (isNaN(requisitionId)) {
    return NextResponse.json(
      { data: null, error: 'Invalid requisition ID' },
      { status: 400 }
    );
  }

  try {
    const { data: requisition, error: reqError } = await supabase
      .from('admin_item_requisitions')
      .select('*')
      .eq('id', requisitionId)
      .single();

    if (reqError) {
      console.error('Error fetching requisition:', reqError);
      return NextResponse.json(
        { data: null, error: 'Requisition not found' },
        { status: 404 }
      );
    }

    if (!requisition) {
      return NextResponse.json(
        { data: null, error: 'Requisition not found' },
        { status: 404 }
      );
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
      .eq('requisition_id', requisitionId);

    if (itemsError) {
      console.error('Error fetching requisition items:', itemsError);
      return NextResponse.json(
        { data: null, error: 'Failed to fetch requisition items' },
        { status: 500 }
      );
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

    return NextResponse.json({ 
      data: requisitionWithItems, 
      error: null 
    });
  } catch (error) {
    console.error('Unexpected error fetching requisition details:', error);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}