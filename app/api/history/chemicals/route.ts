// app/api/history/chemicals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Requisition } from '@/types/chemicals';
import { supabase } from '@/lib/supabase';

interface QueryParams {
  status?: string;
  department?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    let query = supabase
      .from('requisitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (department) {
      query = query.ilike('department', `%${department}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error fetching requisitions:', error);
      return NextResponse.json(
        { data: null, error: 'Failed to fetch requisitions from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data: (data as Requisition[]) || [], 
      error: null 
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/history/chemicals:', error);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

