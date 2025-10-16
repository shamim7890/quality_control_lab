// app/api/dashboard/departments/route.ts

import { NextResponse } from 'next/server';
import { DepartmentStats } from '@/types/database.types';
import { supabase } from '@/lib/supabase';


export async function GET() {
  try {

    // Get all chemical registrations
    const { data: chemRegistrations, error: chemRegError } = await supabase
      .from('chemical_registrations')
      .select('id, department');

    if (chemRegError) {
      console.error('Error fetching chemical registrations:', chemRegError);
      throw chemRegError;
    }

    // Get all chemical items
    const { data: chemItems, error: chemItemsError } = await supabase
      .from('chemical_items')
      .select('id, registration_id');

    if (chemItemsError) {
      console.error('Error fetching chemical items:', chemItemsError);
      throw chemItemsError;
    }

    // Get all admin registrations
    const { data: adminRegistrations, error: adminRegError } = await supabase
      .from('admin_registrations')
      .select('id, department');

    if (adminRegError) {
      console.error('Error fetching admin registrations:', adminRegError);
      throw adminRegError;
    }

    // Get all admin items
    const { data: adminItems, error: adminItemsError } = await supabase
      .from('admin_items')
      .select('id, registration_id');

    if (adminItemsError) {
      console.error('Error fetching admin items:', adminItemsError);
      throw adminItemsError;
    }

    // Create a map of registration_id to department for chemicals
    const chemRegMap = new Map<number, string>();
    chemRegistrations?.forEach(reg => {
      chemRegMap.set(reg.id, reg.department);
    });

    // Create a map of registration_id to department for admin
    const adminRegMap = new Map<number, string>();
    adminRegistrations?.forEach(reg => {
      adminRegMap.set(reg.id, reg.department);
    });

    // Process department statistics
    const deptMap = new Map<string, { chemicalCount: number; adminItemCount: number }>();

    // Count chemical items by department
    chemItems?.forEach(item => {
      const department = chemRegMap.get(item.registration_id);
      if (department) {
        const current = deptMap.get(department) || { chemicalCount: 0, adminItemCount: 0 };
        current.chemicalCount++;
        deptMap.set(department, current);
      }
    });

    // Count admin items by department
    adminItems?.forEach(item => {
      const department = adminRegMap.get(item.registration_id);
      if (department) {
        const current = deptMap.get(department) || { chemicalCount: 0, adminItemCount: 0 };
        current.adminItemCount++;
        deptMap.set(department, current);
      }
    });

    // Convert to array
    const departmentStats: DepartmentStats[] = Array.from(deptMap.entries()).map(
      ([department, counts]) => ({
        department,
        chemicalCount: counts.chemicalCount,
        adminItemCount: counts.adminItemCount,
        totalItems: counts.chemicalCount + counts.adminItemCount
      })
    ).sort((a, b) => b.totalItems - a.totalItems);

    console.log('Department stats:', departmentStats);

    return NextResponse.json(departmentStats);
  } catch (error) {
    console.error('Error fetching department stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department statistics' },
      { status: 500 }
    );
  }
}