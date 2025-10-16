// types/requisition.ts (updated to include ChemicalItem)
export interface Requisition {
  id: number;
  requisition_number: string | null;
  requisition_date: string;
  department: string;
  requester: string;
  requester_user_id: string | null;
  status: 'pending' | 'approved_by_technical_manager_c' | 'approved_by_technical_manager_m' | 'approved_by_senior_assistant_director' | 'approved' | 'rejected' | 'cancelled';
  total_items: number | null;
  technical_manager_c_approved_by: string | null;
  technical_manager_c_approved_at: string | null;
  technical_manager_m_approved_by: string | null;
  technical_manager_m_approved_at: string | null;
  senior_assistant_director_approved_by: string | null;
  senior_assistant_director_approved_at: string | null;
  quality_assurance_manager_approved_by: string | null;
  quality_assurance_manager_approved_at: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejected_by_role: string | null;
  rejection_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChemicalItem {
  id: number;
  name: string;
  unit: string;
  // Add other chemical_items fields as needed
}

export interface RequisitionItem {
  id: number;
  requisition_id: number;
  chemical_item_id: number;
  requested_quantity: number;
  approved_quantity: number | null;
  unit: string;
  expiry_date: string;
  remark: string | null;
  is_processed: boolean | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  chemical_item: ChemicalItem | null;
}

export type RequisitionWithItems = Requisition & {
  requisition_items: RequisitionItem[];
};