// app/api/expiry-tracking/all-chemicals/route.ts

import { NextResponse } from 'next/server';
import { ChemicalWithRegistration } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {

    // Get all chemical items
    const { data: chemicalItems, error: itemsError } = await supabase
      .from('chemical_items')
      .select('*')
      .order('expiry_date', { ascending: true });

    if (itemsError) {
      console.error('Error fetching chemical items:', itemsError);
      throw itemsError;
    }

    // Get all chemical registrations
    const { data: registrations, error: regError } = await supabase
      .from('chemical_registrations')
      .select('*');

    if (regError) {
      console.error('Error fetching chemical registrations:', regError);
      throw regError;
    }

    // Create a map of registration_id to registration details
    const registrationMap = new Map(
      registrations?.map(reg => [reg.id, reg]) || []
    );

    // Combine chemical items with their registration details
    const chemicalsWithRegistration: ChemicalWithRegistration[] = (chemicalItems || [])
      .map(item => {
        const registration = registrationMap.get(item.registration_id);
        if (!registration) {
          console.warn(`No registration found for chemical item ${item.id}`);
          return null;
        }

        return {
          id: item.id,
          registration_id: item.registration_id,
          chemical_name: item.chemical_name,
          quantity: item.quantity,
          expiry_date: item.expiry_date,
          remark: item.remark,
          unit: item.unit,
          created_at: item.created_at,
          updated_at: item.updated_at,
          registration: {
            id: registration.id,
            registration_date: registration.registration_date,
            department: registration.department,
            store_officer: registration.store_officer,
            supplier: registration.supplier,
            created_at: registration.created_at,
            updated_at: registration.updated_at
          }
        };
      })
      .filter((item): item is ChemicalWithRegistration => item !== null);

    console.log(`Fetched ${chemicalsWithRegistration.length} chemicals with registration details`);

    return NextResponse.json(chemicalsWithRegistration);
  } catch (error) {
    console.error('Error fetching chemicals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chemicals' },
      { status: 500 }
    );
  }
}