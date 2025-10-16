"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Save, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"

// Import the AdminItemRow component
import { AdminItemRow, AdminItem } from "@/components/AdminItemRow"

interface ValidationError {
  [key: string]: string
}

interface Product {
  id: number;
  name: string;
  unit: string;
  uses?: string | null;
}

interface Supplier {
  id?: number
  name: string
  address: string
  remarks: string
  created_at?: string
  updated_at?: string
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface SuppliersApiResponse {
  data: Supplier[];
}

interface AdminRegistrationData {
  registration: {
    id: number;
    registration_date: string;
    department: string;
    store_officer: string;
    supplier: string;
    created_at: string;
    updated_at: string;
  };
  items: Array<{
    id: number;
    registration_id: number;
    item_name: string;
    quantity: number;
    remark: string;
    unit: string;
    created_at: string;
    updated_at: string;
  }>;
}

interface AdminRegistrationRequest {
  registrationDate: string;
  department: string;
  storeOfficer: string;
  supplier: string;
  items: AdminItem[];
}

const storeOfficers = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Michael Brown" },
];

export default function AdminRegistrationPage() {
  const [items, setItems] = useState<AdminItem[]>([])
  const [errors, setErrors] = useState<Record<string, ValidationError>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0])
  const [storeOfficer, setStoreOfficer] = useState("")
  const [supplier, setSupplier] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const department = "Main Store"
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true)
  const [suppliersError, setSuppliersError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true)
      setProductsError(null)
      
      const response = await fetch('/api/products')
      const result: ApiResponse<Product[]> = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch products')
      }
      
      setProducts(result.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProductsError(error instanceof Error ? error.message : 'Failed to load products')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      setIsLoadingSuppliers(true)
      setSuppliersError(null)
      
      const response = await fetch('/api/suppliers')
      const result: SuppliersApiResponse = await response.json()
      
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers')
      }
      
      setSuppliers(result.data || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setSuppliersError(error instanceof Error ? error.message : 'Failed to load suppliers')
    } finally {
      setIsLoadingSuppliers(false)
    }
  }

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => setSubmitSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [submitSuccess])

  useEffect(() => {
    if (submitError) {
      const timer = setTimeout(() => setSubmitError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [submitError])

  const validateItem = (item: AdminItem): ValidationError => {
    const errors: ValidationError = {}
    
    if (!item.itemName.trim()) {
      errors.itemName = "Item name is required"
    }
    
    if (!item.quantity || item.quantity <= 0) {
      errors.quantity = "Quantity must be greater than 0"
    }
    
    return errors
  }

  const updateItem = (index: number, updatedItem: AdminItem) => {
    const newItems = [...items]
    newItems[index] = updatedItem
    setItems(newItems)
    
    if (errors[index]) {
      const newErrors = { ...errors }
      delete newErrors[index]
      setErrors(newErrors)
    }
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    
    if (errors[index]) {
      const newErrors = { ...errors }
      delete newErrors[index]
      setErrors(newErrors)
    }
  }

  const addItem = () => {
    const newItem: AdminItem = {
      id: Date.now().toString(),
      itemName: "",
      quantity: 0,
      remark: "",
      unit: ""
    }
    setItems([...items, newItem])
  }

  const validateAll = (): boolean => {
    const newErrors: Record<string, ValidationError> = {}
    const newFormErrors: Record<string, string> = {}
    let isValid = true
    
    if (!storeOfficer) {
      newFormErrors.storeOfficer = "Store officer is required"
      isValid = false
    }

    if (!supplier) {
      newFormErrors.supplier = "Supplier is required"
      isValid = false
    }

    items.forEach((item, index) => {
      const itemErrors = validateItem(item)
      if (Object.keys(itemErrors).length > 0) {
        newErrors[index] = itemErrors
        isValid = false
      }
    })
    
    setErrors(newErrors)
    setFormErrors(newFormErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateAll()) {
      setSubmitError("Please fix the validation errors before submitting")
      return
    }
    
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    
    try {
      const requestData: AdminRegistrationRequest = {
        registrationDate,
        department,
        storeOfficer,
        supplier,
        items
      }

      const response = await fetch('/api/admin-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result: ApiResponse<AdminRegistrationData> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save administrative registration')
      }

      setSubmitSuccess("Administrative registration saved successfully!")
      
      setItems([])
      setRegistrationDate(new Date().toISOString().split('T')[0])
      setStoreOfficer("")
      setSupplier("")
      setErrors({})
      setFormErrors({})
      
    } catch (error) {
      console.error('Error saving administrative registration:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to save administrative registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify({
      registrationDate,
      department,
      storeOfficer,
      supplier,
      items
    }, null, 2)
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `admin-registration-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Execories to the store</h1>
          <p className="text-gray-600">Register and manage Execories items </p>
        </div>

        {submitSuccess && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {submitSuccess}
            </AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        {productsError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error loading products: {productsError}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchProducts}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {suppliersError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error loading suppliers: {suppliersError}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchSuppliers}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              Registration Information
            </CardTitle>
            <CardDescription>
              Enter basic registration details for this inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regDate">Registration Date</Label>
                <Input
                  id="regDate"
                  type="date"
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <div className="flex items-center h-10 px-3 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-gray-700 font-medium">{department}</span>
                </div>
                <p className="text-xs text-gray-500">Department is fixed as Main Store</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeOfficer">Store Officer</Label>
                <select
                  id="storeOfficer"
                  value={storeOfficer}
                  onChange={(e) => setStoreOfficer(e.target.value)}
                  className={`w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.storeOfficer ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Store Officer</option>
                  {storeOfficers.map(officer => (
                    <option key={officer.id} value={officer.name}>{officer.name}</option>
                  ))}
                </select>
                {formErrors.storeOfficer && (
                  <p className="text-xs text-red-500">{formErrors.storeOfficer}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">
                  Supplier
                  {isLoadingSuppliers && (
                    <Loader2 className="h-3 w-3 animate-spin inline ml-2" />
                  )}
                </Label>
                <select
                  id="supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  disabled={isLoadingSuppliers}
                  className={`w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.supplier ? 'border-red-500' : 'border-gray-300'} ${isLoadingSuppliers ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {isLoadingSuppliers ? 'Loading suppliers...' : 'Select Supplier'}
                  </option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.name}>
                      {sup.name} - {sup.address}
                    </option>
                  ))}
                </select>
                {formErrors.supplier && (
                  <p className="text-xs text-red-500">{formErrors.supplier}</p>
                )}
                {suppliers.length === 0 && !isLoadingSuppliers && !suppliersError && (
                  <p className="text-xs text-gray-500">No suppliers available. Please add suppliers first.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Execories Inventory
                  {isLoadingProducts && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
                <CardDescription>
                  Manage Execories inventory items
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={addItem}
                  disabled={isLoadingProducts}
                >
                  <Plus size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 w-16 ">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-40">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-48">Unit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Remarks</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Plus size={48} className="text-gray-300" />
                          <p>No items registered yet</p>
                          <Button 
                            onClick={addItem}
                            disabled={isLoadingProducts}
                            className="mt-2"
                          >
                            {isLoadingProducts ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Loading Products...
                              </>
                            ) : (
                              "Add First Item"
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <AdminItemRow
                        key={item.id}
                        index={index}
                        item={item}
                        updateItem={updateItem}
                        removeItem={removeItem}
                        errors={errors[index] || {}}
                        products={products}
                        isLoadingProducts={isLoadingProducts}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end items-center mt-8">
          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || items.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Registration
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}