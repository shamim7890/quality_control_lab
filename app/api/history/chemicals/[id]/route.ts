// app/api/history/chemicals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RequisitionWithItems } from '@/types/chemicals';

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
      .from('requisitions')
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
      .from('requisition_items')
      .select(`
        *,
        chemical_items (
          chemical_name,
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