// types/database.types.ts

export interface Supplier {
  id: number;
  name: string;
  address: string;
  remarks: string;
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

export interface ChemicalItem {
  id: number;
  registration_id: number;
  chemical_name: string;
  quantity: number;
  expiry_date: string;
  remark: string;
  unit: string;
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

export interface AdminItem {
  id: number;
  registration_id: number;
  item_name: string;
  quantity: number;
  remark: string | null;
  unit: string;
  created_at: string;
  updated_at: string;
}

// Dashboard specific types
export interface DashboardStats {
  totalChemicals: number;
  totalAdminItems: number;
  expiringChemicals: number;
  lowStockItems: number;
  totalDepartments: number;
  recentRegistrations: number;
}

export interface ChemicalWithRegistration extends ChemicalItem {
  registration: ChemicalRegistration;
}

export interface AdminItemWithRegistration extends AdminItem {
  registration: AdminRegistration;
}

export interface DepartmentStats {
  department: string;
  chemicalCount: number;
  adminItemCount: number;
  totalItems: number;
}

export interface SupplierStats {
  supplier: string;
  totalRegistrations: number;
  chemicalRegistrations: number;
  adminRegistrations: number;
}