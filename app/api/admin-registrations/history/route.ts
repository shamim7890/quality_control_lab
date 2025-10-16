import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface AdminRegistration {
  id: number
  registration_date: string
  department: string
  store_officer: string
  supplier: string
  created_at: string
  updated_at: string
  items: Array<{
    id: number
    registration_id: number
    item_name: string
    quantity: number
    remark: string
    unit: string
    created_at: string
    updated_at: string
  }>
}



export async function GET() {
  try {
    // Fetch registrations with their associated items
    const { data: registrations, error: registrationError } = await supabase
      .from('admin_registrations')
      .select(`
        id,
        registration_date,
        department,
        store_officer,
        supplier,
        created_at,
        updated_at,
        admin_items (
          id,
          registration_id,
          item_name,
          quantity,
          remark,
          unit,
          created_at,
          updated_at
        )
      `)
      .order('registration_date', { ascending: false })

    if (registrationError) {
      throw new Error(`Failed to fetch registrations: ${registrationError.message}`)
    }

    // Transform data to match expected format
    const formattedRegistrations: AdminRegistration[] = registrations.map(reg => ({
      ...reg,
      items: reg.admin_items
    }))

    return new Response(JSON.stringify({
      success: true,
      data: formattedRegistrations
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in GET /api/admin-registrations/history:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch history'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}