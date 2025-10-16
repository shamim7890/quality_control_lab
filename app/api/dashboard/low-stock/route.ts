// app/api/dashboard/low-stock/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface LowStockItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  department: string;
  type: 'chemical' | 'admin';
}

export async function GET() {
  try {

    // Get low stock chemicals (quantity < 10)
    const { data: lowChemicals, error: chemError } = await supabase
      .from('chemical_items')
      .select(`
        id,
        chemical_name,
        quantity,
        unit,
        chemical_registrations (
          department
        )
      `)
      .lt('quantity', 10)
      .order('quantity', { ascending: true });

    if (chemError) throw chemError;

    // Get low stock admin items (quantity < 10)
    const { data: lowAdmin, error: adminError } = await supabase
      .from('admin_items')
      .select(`
        id,
        item_name,
        quantity,
        unit,
        admin_registrations (
          department
        )
      `)
      .lt('quantity', 10)
      .order('quantity', { ascending: true });

    if (adminError) throw adminError;

    // Combine and format the results
    const lowStockItems: LowStockItem[] = [
      ...(lowChemicals?.map(item => ({
        id: item.id,
        name: item.chemical_name,
        quantity: item.quantity,
        unit: item.unit,
        department: Array.isArray(item.chemical_registrations) && item.chemical_registrations.length > 0
          ? item.chemical_registrations[0].department
          : 'Unknown',
        type: 'chemical' as const
      })) || []),
      ...(lowAdmin?.map(item => ({
        id: item.id,
        name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        department: Array.isArray(item.admin_registrations) && item.admin_registrations.length > 0
          ? item.admin_registrations[0].department
          : 'Unknown',
        type: 'admin' as const
      })) || [])
    ].sort((a, b) => a.quantity - b.quantity);

    return NextResponse.json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock items' },
      { status: 500 }
    );
  }
}