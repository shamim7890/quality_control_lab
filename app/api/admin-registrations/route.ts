import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface AdminRegistrationRequest {
  registrationDate: string;
  department: string;
  storeOfficer: string;
  supplier: string;
  items: Array<{
    itemName: string;
    quantity: number;
    remark: string;
    unit: string;
  }>;
}


export async function POST(request: Request) {
  try {
    const body: AdminRegistrationRequest = await request.json()

    // Start a transaction
    const { data: registrationData, error: registrationError } = await supabase
      .from('admin_registrations')
      .insert({
        registration_date: body.registrationDate,
        department: body.department,
        store_officer: body.storeOfficer,
        supplier: body.supplier,
      })
      .select()
      .single()

    if (registrationError) {
      throw new Error(`Failed to create registration: ${registrationError.message}`)
    }

    if (!registrationData?.id) {
      throw new Error('Failed to get registration ID')
    }

    // Prepare items for batch insert
    const itemsToInsert = body.items.map(item => ({
      registration_id: registrationData.id,
      item_name: item.itemName,
      quantity: item.quantity,
      remark: item.remark,
      unit: item.unit,
    }))

    // Insert items
    const { error: itemsError } = await supabase
      .from('admin_items')
      .insert(itemsToInsert)

    if (itemsError) {
      // Rollback by deleting the registration if items insertion fails
      await supabase
        .from('admin_registrations')
        .delete()
        .eq('id', registrationData.id)
      throw new Error(`Failed to save items: ${itemsError.message}`)
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Administrative registration saved successfully',
      data: {
        registration: registrationData,
        items: itemsToInsert
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in POST /api/admin-registrations:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save administrative registration'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}