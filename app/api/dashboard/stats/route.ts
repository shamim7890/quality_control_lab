// app/api/dashboard/stats/route.ts

import { NextResponse } from 'next/server';
import { DashboardStats } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {

    // Get total chemicals
    const { count: totalChemicals, error: chemError } = await supabase
      .from('chemical_items')
      .select('*', { count: 'exact', head: true });

    if (chemError) throw chemError;

    // Get total admin items
    const { count: totalAdminItems, error: adminError } = await supabase
      .from('admin_items')
      .select('*', { count: 'exact', head: true });

    if (adminError) throw adminError;

    // Get expiring chemicals (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const { count: expiringChemicals, error: expiringError } = await supabase
      .from('chemical_items')
      .select('*', { count: 'exact', head: true })
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);

    if (expiringError) throw expiringError;

    // Get low stock items (quantity < 10)
    const { count: lowStockChemicals, error: lowStockChemError } = await supabase
      .from('chemical_items')
      .select('*', { count: 'exact', head: true })
      .lt('quantity', 10);

    const { count: lowStockAdmin, error: lowStockAdminError } = await supabase
      .from('admin_items')
      .select('*', { count: 'exact', head: true })
      .lt('quantity', 10);

    if (lowStockChemError || lowStockAdminError) {
      throw lowStockChemError || lowStockAdminError;
    }

    const lowStockItems = (lowStockChemicals || 0) + (lowStockAdmin || 0);

    // Get unique departments
    const { data: chemDepts, error: chemDeptsError } = await supabase
      .from('chemical_registrations')
      .select('department');

    const { data: adminDepts, error: adminDeptsError } = await supabase
      .from('admin_registrations')
      .select('department');

    if (chemDeptsError || adminDeptsError) {
      throw chemDeptsError || adminDeptsError;
    }

    const uniqueDepartments = new Set([
      ...(chemDepts?.map(d => d.department) || []),
      ...(adminDepts?.map(d => d.department) || [])
    ]);

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentChemReg, error: recentChemError } = await supabase
      .from('chemical_registrations')
      .select('*', { count: 'exact', head: true })
      .gte('registration_date', sevenDaysAgo.toISOString().split('T')[0]);

    const { count: recentAdminReg, error: recentAdminError } = await supabase
      .from('admin_registrations')
      .select('*', { count: 'exact', head: true })
      .gte('registration_date', sevenDaysAgo.toISOString().split('T')[0]);

    if (recentChemError || recentAdminError) {
      throw recentChemError || recentAdminError;
    }

    const stats: DashboardStats = {
      totalChemicals: totalChemicals || 0,
      totalAdminItems: totalAdminItems || 0,
      expiringChemicals: expiringChemicals || 0,
      lowStockItems,
      totalDepartments: uniqueDepartments.size,
      recentRegistrations: (recentChemReg || 0) + (recentAdminReg || 0)
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}