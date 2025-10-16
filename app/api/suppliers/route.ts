// app/api/suppliers/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface Supplier {
  id?: number
  name: string
  address: string
  remarks: string
  created_at?: string
  updated_at?: string
}

// GET - Fetch all suppliers
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, remarks } = body

    // Validation
    if (!name || !address || !remarks) {
      return NextResponse.json(
        { error: 'Name, address, and remarks are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert([
        {
          name: name.trim(),
          address: address.trim(),
          remarks: remarks.trim(),
        }
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Supplier created successfully', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update supplier
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, address, remarks } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      )
    }

    if (!name || !address || !remarks) {
      return NextResponse.json(
        { error: 'Name, address, and remarks are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update({
        name: name.trim(),
        address: address.trim(),
        remarks: remarks.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Supplier updated successfully',
      data,
    })
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete supplier
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Supplier deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}