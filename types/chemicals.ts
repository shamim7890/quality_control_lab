// types/chemicals.ts

export type RequisitionStatus = 
  | 'pending' 
  | 'approved_by_admin' 
  | 'approved_by_moderator' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled';

export interface Requisition {
  id: number;
  requisition_number: string;
  requisition_date: string;
  department: string;
  requester: string;
  requester_user_id?: string;
  status: RequisitionStatus;
  total_items: number;
  admin_approved_by?: string;
  admin_approved_at?: string;
  moderator_approved_by?: string;
  moderator_approved_at?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RequisitionItem {
  id: number;
  requisition_id: number;
  chemical_item_id: number;
  requested_quantity: number;
  approved_quantity: number;
  unit: string;
  expiry_date: string;
  remark?: string;
  is_processed: boolean;
  processed_at?: string;
  chemical_name: string;
  quantity: number;
}

export interface RequisitionWithItems extends Requisition {
  items: RequisitionItem[];
}

export type HistoryType = 'audit' | 'transaction';

export interface RequisitionHistoryItem {
  type: HistoryType;
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

export interface ChemicalItem {
  id: number;
  registration_id: number;
  chemical_name: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  remark?: string;
  created_at: string;
  updated_at: string;
}

export interface ChemicalRegistration {
  id: number;
  registration_date: string;
  department: string;
  store_officer: string;
  supplier: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
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

export interface InventoryTransaction {
  id: number;
  chemical_item_id: number;
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
  status: RequisitionStatus | 'all';
  department?: string;
  dateFrom?: string;
  dateTo?: string;
}