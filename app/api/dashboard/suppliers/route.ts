// app/api/dashboard/suppliers/route.ts

import { NextResponse } from 'next/server';
import { SupplierStats } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {

    // Get chemical registrations grouped by supplier
    const { data: chemRegistrations, error: chemError } = await supabase
      .from('chemical_registrations')
      .select('supplier');

    if (chemError) throw chemError;

    // Get admin registrations grouped by supplier
    const { data: adminRegistrations, error: adminError } = await supabase
      .from('admin_registrations')
      .select('supplier');

    if (adminError) throw adminError;

    // Process supplier statistics
    const supplierMap = new Map<string, { chemicalReg: number; adminReg: number }>();

    // Count chemical registrations by supplier
    chemRegistrations?.forEach(reg => {
      const supplier = reg.supplier;
      const current = supplierMap.get(supplier) || { chemicalReg: 0, adminReg: 0 };
      current.chemicalReg++;
      supplierMap.set(supplier, current);
    });

    // Count admin registrations by supplier
    adminRegistrations?.forEach(reg => {
      const supplier = reg.supplier;
      const current = supplierMap.get(supplier) || { chemicalReg: 0, adminReg: 0 };
      current.adminReg++;
      supplierMap.set(supplier, current);
    });

    // Convert to array
    const supplierStats: SupplierStats[] = Array.from(supplierMap.entries())
      .map(([supplier, counts]) => ({
        supplier,
        totalRegistrations: counts.chemicalReg + counts.adminReg,
        chemicalRegistrations: counts.chemicalReg,
        adminRegistrations: counts.adminReg
      }))
      .sort((a, b) => b.totalRegistrations - a.totalRegistrations);

    return NextResponse.json(supplierStats);
  } catch (error) {
    console.error('Error fetching supplier stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier statistics' },
      { status: 500 }
    );
  }
}