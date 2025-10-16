// app/api/history/chemicals/[id]/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RequisitionHistoryItem } from '@/types/chemicals';
import { supabase } from '@/lib/supabase';

interface AuditLog {
  id: number;
  requisition_id: number;
  action: string;
  performed_by: string;
  performed_by_role: string | null;
  old_status: string | null;
  new_status: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface RequisitionItemSimple {
  id: number;
  requisition_id: number;
}

interface InventoryTransaction {
  id: number;
  chemical_item_id: number;
  requisition_item_id: number | null;
  transaction_type: string;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  performed_by: string;
  reason: string | null;
  created_at: string;
  requisition_items: RequisitionItemSimple[] | null;
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
    const { data: auditLogs, error: auditError } = await supabase
      .from('requisition_audit_log')
      .select('*')
      .eq('requisition_id', requisitionId)
      .order('created_at', { ascending: false });

    if (auditError) {
      console.error('Error fetching audit logs:', auditError);
      return NextResponse.json(
        { data: null, error: 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }

    const { data: requisitionItems, error: reqItemsError } = await supabase
      .from('requisition_items')
      .select('id')
      .eq('requisition_id', requisitionId);

    if (reqItemsError) {
      console.error('Error fetching requisition items:', reqItemsError);
      return NextResponse.json(
        { data: null, error: 'Failed to fetch requisition items' },
        { status: 500 }
      );
    }

    const itemIds = requisitionItems?.map((item: { id: number }) => item.id) || [];

    let transactions: InventoryTransaction[] = [];
    
    if (itemIds.length > 0) {
      const { data: rawTransactions, error: txError } = await supabase
        .from('inventory_transactions')
        .select(`
          id,
          chemical_item_id,
          requisition_item_id,
          transaction_type,
          quantity_change,
          quantity_before,
          quantity_after,
          performed_by,
          reason,
          created_at,
          requisition_items(id, requisition_id)
        `)
        .in('requisition_item_id', itemIds)
        .order('created_at', { ascending: false });

      if (txError) {
        console.error('Error fetching transactions:', txError);
      } else {
        transactions = rawTransactions as unknown as InventoryTransaction[];
      }
    }

    const history: RequisitionHistoryItem[] = [];

    if (auditLogs) {
      history.push(
        ...auditLogs.map((log: AuditLog): RequisitionHistoryItem => ({
          type: 'audit',
          timestamp: log.created_at,
          action: log.action,
          performed_by: log.performed_by,
          role: log.performed_by_role || undefined,
          old_status: log.old_status || undefined,
          new_status: log.new_status || undefined,
          details: log.details || undefined,
        }))
      );
    }

    if (transactions) {
      history.push(
        ...transactions
          .filter((tx) => tx.requisition_items && tx.requisition_items.length > 0)
          .map((tx): RequisitionHistoryItem => ({
            type: 'transaction',
            timestamp: tx.created_at,
            action: tx.transaction_type,
            performed_by: tx.performed_by,
            quantity_change: tx.quantity_change,
            quantity_before: tx.quantity_before,
            quantity_after: tx.quantity_after,
            reason: tx.reason || undefined,
          }))
      );
    }

    history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ data: history, error: null });
  } catch (error) {
    console.error('Unexpected error fetching history:', error);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}