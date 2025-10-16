// types/admin.ts (New types file for admin items)
export interface AdminRequisition {
  id: number;
  requisition_number: string;
  requisition_date: string; // ISO date string
  department: string;
  requester: string;
  requester_user_id?: string;
  status: 'pending' | 'approved_by_technical_manager_c' | 'approved_by_technical_manager_m' | 'approved_by_senior_assistant_director' | 'approved' | 'rejected' | 'cancelled';
  total_items: number;
  technical_manager_c_approved_by?: string;
  technical_manager_c_approved_at?: string;
  technical_manager_m_approved_by?: string;
  technical_manager_m_approved_at?: string;
  senior_assistant_director_approved_by?: string;
  senior_assistant_director_approved_at?: string;
  quality_assurance_manager_approved_by?: string;
  quality_assurance_manager_approved_at?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejected_by_role?: string;
  rejection_reason?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminRequisitionItem {
  id: number;
  requisition_id: number;
  admin_item_id: number;
  requested_quantity: number;
  approved_quantity: number;
  unit: string;
  remark?: string;
  is_processed: boolean;
  processed_at?: string;
  item_name: string; // Joined from admin_items
  quantity: number; // Current stock from admin_items (for reference)
}

export interface AdminRequisitionHistoryItem {
  type: 'audit' | 'transaction';
  timestamp: string;
  action: string;
  performed_by: string;
  role?: string;
  old_status?: string;
  new_status?: string;
  details?: object;
  quantity_change?: number;
  quantity_before?: number;
  quantity_after?: number;
  reason?: string;
}

export interface AdminRequisitionWithItems extends AdminRequisition {
  items: AdminRequisitionItem[];
}

export interface ApiResponse<T> {
  data: T[] | null;
  error: string | null;
}