import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Types for the request
interface ChemicalItem {
  id: string
  chemicalName: string
  quantity: number
  expiryDate: string
  remark: string
  unit: string
}

interface ChemicalRegistrationRequest {
  registrationDate: string
  department: string
  storeOfficer: string
  supplier: string
  chemicals: ChemicalItem[]
}

// Database types
interface DatabaseChemicalRegistration {
  id?: number
  registration_date: string
  department: string
  store_officer: string
  supplier: string
  created_at?: string
  updated_at?: string
}

interface DatabaseChemicalItem {
  id?: number
  registration_id: number
  chemical_name: string
  quantity: number
  expiry_date: string
  remark: string
  unit: string
  created_at?: string
  updated_at?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChemicalRegistrationRequest = await request.json()
    
    // Validate required fields
    if (!body.registrationDate || !body.department || !body.storeOfficer || !body.supplier || !body.chemicals || body.chemicals.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: registrationDate, department, storeOfficer, supplier, or chemicals' },
        { status: 400 }
      )
    }

    // Validate each chemical item
    for (const chemical of body.chemicals) {
      if (!chemical.chemicalName.trim()) {
        return NextResponse.json(
          { error: 'Chemical name is required for all items' },
          { status: 400 }
        )
      }
      if (!chemical.quantity || chemical.quantity <= 0) {
        return NextResponse.json(
          { error: 'Quantity must be greater than 0 for all items' },
          { status: 400 }
        )
      }
      if (!chemical.expiryDate) {
        return NextResponse.json(
          { error: 'Expiry date is required for all items' },
          { status: 400 }
        )
      }
    }

    // Start a transaction-like operation
    // First, insert the main registration record
    const registrationData: DatabaseChemicalRegistration = {
      registration_date: body.registrationDate,
      department: body.department,
      store_officer: body.storeOfficer,
      supplier: body.supplier,
    }

    const { data: registrationResult, error: registrationError } = await supabase
      .from('chemical_registrations')
      .insert([registrationData])
      .select()
      .single()

    if (registrationError) {
      console.error('Error inserting registration:', registrationError)
      return NextResponse.json(
        { error: 'Failed to save registration: ' + registrationError.message },
        { status: 500 }
      )
    }

    // Then, insert all chemical items
    const chemicalItems: DatabaseChemicalItem[] = body.chemicals.map(chemical => ({
      registration_id: registrationResult.id!,
      chemical_name: chemical.chemicalName,
      quantity: chemical.quantity,
      expiry_date: chemical.expiryDate,
      remark: chemical.remark || '',
      unit: chemical.unit || '',
    }))

    const { data: chemicalResult, error: chemicalError } = await supabase
      .from('chemical_items')
      .insert(chemicalItems)
      .select()

    if (chemicalError) {
      console.error('Error inserting chemical items:', chemicalError)
      
      // If chemical items failed, we should clean up the registration
      await supabase
        .from('chemical_registrations')
        .delete()
        .eq('id', registrationResult.id)

      return NextResponse.json(
        { error: 'Failed to save chemical items: ' + chemicalError.message },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Chemical registration saved successfully',
      data: {
        registration: registrationResult,
        chemicals: chemicalResult
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: GET method to retrieve registrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('id')

    if (registrationId) {
      // Get specific registration with its chemicals
      const { data: registration, error: regError } = await supabase
        .from('chemical_registrations')
        .select(`
          *,
          chemical_items (*)
        `)
        .eq('id', registrationId)
        .single()

      if (regError) {
        return NextResponse.json(
          { error: 'Registration not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: registration
      })
    } else {
      // Get all registrations
      const { data: registrations, error } = await supabase
        .from('chemical_registrations')
        .select(`
          *,
          chemical_items (*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch registrations' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: registrations
      })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}