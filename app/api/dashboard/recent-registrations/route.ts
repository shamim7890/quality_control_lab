// app/api/dashboard/recent-registrations/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';


interface RecentRegistration {
  id: number;
  registration_date: string;
  department: string;
  store_officer: string;
  supplier: string;
  type: 'chemical' | 'admin';
  item_count: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');


    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    const dateFilter = daysAgo.toISOString().split('T')[0];

    // Get recent chemical registrations
    const { data: chemRegistrations, error: chemError } = await supabase
      .from('chemical_registrations')
      .select(`
        id,
        registration_date,
        department,
        store_officer,
        supplier,
        chemical_items (count)
      `)
      .gte('registration_date', dateFilter)
      .order('registration_date', { ascending: false });

    if (chemError) throw chemError;

    // Get recent admin registrations
    const { data: adminRegistrations, error: adminError } = await supabase
      .from('admin_registrations')
      .select(`
        id,
        registration_date,
        department,
        store_officer,
        supplier,
        admin_items (count)
      `)
      .gte('registration_date', dateFilter)
      .order('registration_date', { ascending: false });

    if (adminError) throw adminError;

    // Combine and format the results
    const recentRegistrations: RecentRegistration[] = [
      ...(chemRegistrations?.map(reg => ({
        id: reg.id,
        registration_date: reg.registration_date,
        department: reg.department,
        store_officer: reg.store_officer,
        supplier: reg.supplier,
        type: 'chemical' as const,
        item_count: (reg.chemical_items as unknown as { count: number }[])?.[0]?.count || 0
      })) || []),
      ...(adminRegistrations?.map(reg => ({
        id: reg.id,
        registration_date: reg.registration_date,
        department: reg.department,
        store_officer: reg.store_officer,
        supplier: reg.supplier,
        type: 'admin' as const,
        item_count: (reg.admin_items as unknown as { count: number }[])?.[0]?.count || 0
      })) || [])
    ].sort((a, b) => 
      new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime()
    );

    return NextResponse.json(recentRegistrations);
  } catch (error) {
    console.error('Error fetching recent registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent registrations' },
      { status: 500 }
    );
  }
}