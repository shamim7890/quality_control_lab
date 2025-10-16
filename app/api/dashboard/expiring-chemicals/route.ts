// app/api/dashboard/expiring-chemicals/route.ts

import { NextResponse } from 'next/server';
import { ChemicalWithRegistration } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {

    // Get chemicals expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data, error } = await supabase
      .from('chemical_items')
      .select(`
        *,
        chemical_registrations (
          id,
          registration_date,
          department,
          store_officer,
          supplier,
          created_at,
          updated_at
        )
      `)
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .order('expiry_date', { ascending: true });

    if (error) throw error;

    const expiringChemicals: ChemicalWithRegistration[] = (data || []).map(item => ({
      id: item.id,
      registration_id: item.registration_id,
      chemical_name: item.chemical_name,
      quantity: item.quantity,
      expiry_date: item.expiry_date,
      remark: item.remark,
      unit: item.unit,
      created_at: item.created_at,
      updated_at: item.updated_at,
      registration: item.chemical_registrations as {
        id: number;
        registration_date: string;
        department: string;
        store_officer: string;
        supplier: string;
        created_at: string;
        updated_at: string;
      }
    }));

    return NextResponse.json(expiringChemicals);
  } catch (error) {
    console.error('Error fetching expiring chemicals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expiring chemicals' },
      { status: 500 }
    );
  }
}