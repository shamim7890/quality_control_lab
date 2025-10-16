//api/products/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface Product {
  id?: number;
  name: string;
  unit: string;
  uses?: string | null;
}

// GET: Fetch all products
export async function GET() {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new product
export async function POST(request: Request) {
  try {
    const product: Product = await request.json();
    const { name, unit, uses } = product;

    if (!name || !unit) {
      return NextResponse.json({ error: 'Name and unit are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, unit, uses }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}