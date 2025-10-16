// types/admin-items.ts

export type AdminRequisitionStatus = 
  | 'pending' 
  | 'approved_by_technical_manager_c' 
  | 'approved_by_technical_manager_m' 
  | 'approved_by_senior_assistant_director' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled';

export interface AdminRequisition {
  id: number;
  requisition_number: string;
  requisition_date: string;
  department: string;
  requester: string;
  requester_user_id?: string;
  status: AdminRequisitionStatus;
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
  item_name: string;
  quantity: number;
}

export interface AdminRequisitionWithItems extends AdminRequisition {
  items: AdminRequisitionItem[];
}

export type AdminHistoryType = 'audit' | 'transaction';

export interface AdminRequisitionHistoryItem {
  type: AdminHistoryType;
  timestamp: string;
  action: string;
  performed_by: string;
  role?: string;
  old_status?: string;
  new_status?: string;
  details?: Record<string, unknown>;
  quantity_change?: number;
  quantity_before?: number;
  quantity_after?: number;
  reason?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface AdminItem {
  id: number;
  registration_id: number;
  item_name: string;
  quantity: number;
  unit: string;
  remark?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminRegistration {
  id: number;
  registration_date: string;
  department: string;
  store_officer: string;
  supplier: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLogEntry {
  id: number;
  requisition_id: number;
  action: string;
  performed_by: string;
  performed_by_role?: string;
  old_status?: string;
  new_status?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface AdminInventoryTransaction {
  id: number;
  admin_item_id: number;
  requisition_item_id?: number;
  transaction_type: 'requisition_deduction' | 'manual_adjustment' | 'registration_addition';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  performed_by: string;
  reason?: string;
  created_at: string;
}

export interface StatusBadgeConfig {
  color: string;
  label: string;
  icon?: string;
}

export interface FilterOptions {
  status: AdminRequisitionStatus | 'all';
  department?: string;
  dateFrom?: string;
  dateTo?: string;
}