// app/api/chemical-history/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Define TypeScript interfaces
interface ChemicalItem {
  id: number
  registration_id: number
  chemical_name: string
  quantity: number
  expiry_date: string
  remark: string
  unit: string
  created_at: string
  updated_at: string
}

interface ChemicalHistoryResponse {
  id: number
  registration_date: string
  department: string
  store_officer: string
  supplier: string
  created_at: string
  updated_at: string
  chemical_items: ChemicalItem[]
}

// Interface for Supabase query result
interface SupabaseRegistration {
  id: number
  registration_date: string
  department: string
  store_officer: string
  supplier: string
  created_at: string
  updated_at: string
  chemical_items: ChemicalItem[]
}

// Interface for POST request body
interface CreateRegistrationRequest {
  department: string
  store_officer?: string
  supplier?: string
  registration_date?: string
  chemical_items?: {
    chemical_name: string
    quantity: number
    expiry_date: string
    remark?: string
    unit?: string
  }[]
}

export async function GET() {
  try {
    // Fetch chemical registrations with their associated items
    const { data, error } = await supabase
      .from('chemical_registrations')
      .select(`
        id,
        registration_date,
        department,
        store_officer,
        supplier,
        created_at,
        updated_at,
        chemical_items (
          id,
          registration_id,
          chemical_name,
          quantity,
          expiry_date,
          remark,
          unit,
          created_at,
          updated_at
        )
      `)
      .order('registration_date', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch chemical history' },
        { status: 500 }
      )
    }

    // Transform the data to match our expected format
    const formattedData: ChemicalHistoryResponse[] = data?.map((registration: SupabaseRegistration) => ({
      id: registration.id,
      registration_date: registration.registration_date,
      department: registration.department,
      store_officer: registration.store_officer,
      supplier: registration.supplier,
      created_at: registration.created_at,
      updated_at: registration.updated_at,
      chemical_items: registration.chemical_items || []
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: Add POST method for creating new registrations
export async function POST(request: Request) {
  try {
    const body: CreateRegistrationRequest = await request.json()
    const { department, store_officer, supplier, registration_date, chemical_items } = body

    // Start a transaction-like operation
    // First, create the registration
    const { data: registration, error: regError } = await supabase
      .from('chemical_registrations')
      .insert([
        {
          department,
          store_officer: store_officer || 'Unknown',
          supplier: supplier || 'Unknown',
          registration_date: registration_date || new Date().toISOString().split('T')[0]
        }
      ])
      .select()
      .single()

    if (regError) {
      return NextResponse.json(
        { error: 'Failed to create registration' },
        { status: 500 }
      )
    }

    // Then, create the chemical items
    if (chemical_items && chemical_items.length > 0) {
      const itemsToInsert = chemical_items.map((item) => ({
        registration_id: registration.id,
        chemical_name: item.chemical_name,
        quantity: item.quantity,
        expiry_date: item.expiry_date,
        remark: item.remark || '',
        unit: item.unit || ''
      }))

      const { error: itemsError } = await supabase
        .from('chemical_items')
        .insert(itemsToInsert)

      if (itemsError) {
        // If items creation fails, we might want to delete the registration
        await supabase
          .from('chemical_registrations')
          .delete()
          .eq('id', registration.id)
        
        return NextResponse.json(
          { error: 'Failed to create chemical items' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Chemical registration created successfully',
      registration_id: registration.id
    })

  } catch (error) {
    console.error('POST API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}