"use client"

import { useState, useEffect, useMemo } from "react"
import { format, parseISO, isWithinInterval } from "date-fns"
import * as XLSX from 'xlsx'

// TypeScript interfaces
interface AdminItem {
  id: number
  registration_id: number
  item_name: string
  quantity: number
  remark: string
  unit: string
  created_at: string
  updated_at: string
}

interface AdminRegistration {
  id: number
  registration_date: string
  department: string
  store_officer: string
  supplier: string
  created_at: string
  updated_at: string
  items: AdminItem[]
}

interface FlattenedItem extends AdminItem {
  registration_date: string
  department: string
  store_officer: string
  supplier: string
}

interface ApiResponse {
  success: boolean
  data?: AdminRegistration[]
  error?: string
  message?: string
}

interface FilterState {
  itemName: string
  startDate: string
  endDate: string
  storeOfficer: string
  supplier: string
  department: string
}

interface ExcelExportData {
  'Registration Date': string
  'Item Name': string
  'Department': string
  'Store Officer': string
  'Supplier': string
  'Quantity': string
  'Unit': string
  'Remarks': string
}

const ITEMS_PER_PAGE = 15

export default function AdminItemsHistoryPage() {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    itemName: '',
    startDate: '',
    endDate: '',
    storeOfficer: '',
    supplier: '',
    department: ''
  })

  // Fetch data from API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin-registrations/history')
        const result: ApiResponse = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch data')
        }

        if (result.success) {
          setRegistrations(result.data || [])
        } else {
          throw new Error(result.error || 'API returned unsuccessful response')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  // Flatten all items from all registrations
  const allItems = useMemo(() => {
    return registrations.flatMap(registration => 
      registration.items.map(item => ({
        ...item,
        registration_date: registration.registration_date,
        department: registration.department,
        store_officer: registration.store_officer,
        supplier: registration.supplier
      }))
    )
  }, [registrations])

  // Get unique values for filter dropdowns
  const storeOfficers = useMemo(() => {
    const officerSet = new Set(registrations.map(reg => reg.store_officer))
    return Array.from(officerSet).sort()
  }, [registrations])

  const suppliers = useMemo(() => {
    const supplierSet = new Set(registrations.map(reg => reg.supplier))
    return Array.from(supplierSet).sort()
  }, [registrations])

  const departments = useMemo(() => {
    const deptSet = new Set(registrations.map(reg => reg.department))
    return Array.from(deptSet).sort()
  }, [registrations])

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = allItems

    // Filter by item name
    if (filters.itemName) {
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(filters.itemName.toLowerCase())
      )
    }

    // Filter by store officer
    if (filters.storeOfficer) {
      filtered = filtered.filter(item => item.store_officer === filters.storeOfficer)
    }

    // Filter by supplier
    if (filters.supplier) {
      filtered = filtered.filter(item => item.supplier === filters.supplier)
    }

    // Filter by department
    if (filters.department) {
      filtered = filtered.filter(item => item.department === filters.department)
    }

    // Filter by date range (using registration date)
    if (filters.startDate && filters.endDate) {
      const startDate = parseISO(filters.startDate)
      const endDate = parseISO(filters.endDate)
      
      filtered = filtered.filter(item => {
        const regDate = parseISO(item.registration_date)
        return isWithinInterval(regDate, { start: startDate, end: endDate })
      })
    }

    // Sort by registration date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime()
    )
  }, [allItems, filters])

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Format date helper
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string): void => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = (): void => {
    setFilters({
      itemName: '',
      startDate: '',
      endDate: '',
      storeOfficer: '',
      supplier: '',
      department: ''
    })
  }

  // Export to Excel
  const exportToExcel = (): void => {
    const exportData: ExcelExportData[] = filteredItems.map(item => ({
      'Registration Date': formatDate(item.registration_date),
      'Item Name': item.item_name,
      'Department': item.department || '-',
      'Store Officer': item.store_officer || '-',
      'Supplier': item.supplier || '-',
      'Quantity': item.quantity.toFixed(3),
      'Unit': item.unit || '-',
      'Remarks': item.remark || '-'
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)

    const columnWidths = [
      { wch: 18 }, // Registration Date
      { wch: 25 }, // Item Name
      { wch: 20 }, // Department
      { wch: 20 }, // Store Officer
      { wch: 20 }, // Supplier
      { wch: 12 }, // Quantity
      { wch: 10 }, // Unit
      { wch: 30 }  // Remarks
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin Items')

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
    const filename = `Admin_Items_${timestamp}.xlsx`

    XLSX.writeFile(workbook, filename)
  }

  // Generate page numbers for pagination
  const getPageNumbers = (): number[] => {
    const pages: number[] = []
    const maxVisible = 7
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      const end = Math.min(totalPages, start + maxVisible - 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-ping opacity-20 mx-auto"></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Loading administrative items...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Unable to Load Data</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Execories Items</h1>
              <p className="text-slate-600 text-lg">
                Comprehensive management and tracking system
              </p>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Items</p>
                <p className="text-3xl font-bold text-slate-900">{filteredItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Active Filters</p>
                <p className="text-3xl font-bold text-slate-900">
                  {Object.values(filters).filter(v => v !== '').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Current Page</p>
                <p className="text-3xl font-bold text-slate-900">{currentPage} / {totalPages || 1}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Filters</h2>
            {Object.values(filters).filter(v => v !== '').length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Item Name Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Item Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.itemName}
                  onChange={(e) => handleFilterChange('itemName', e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Store Officer Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Store Officer
              </label>
              <select
                value={filters.storeOfficer}
                onChange={(e) => handleFilterChange('storeOfficer', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              >
                <option value="">All Officers</option>
                {storeOfficers.map(officer => (
                  <option key={officer} value={officer}>{officer}</option>
                ))}
              </select>
            </div>

            {/* Supplier Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Supplier
              </label>
              <select
                value={filters.supplier}
                onChange={(e) => handleFilterChange('supplier', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              >
                <option value="">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Results Found</h3>
              <p className="text-slate-600 mb-6">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Registration Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Store Officer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {paginatedItems.map((item, index) => (
                      <tr key={`${item.registration_id}-${item.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">
                            {formatDate(item.registration_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900">
                            {item.item_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-700">{item.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-700">{item.store_officer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-700">{item.supplier}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900">
                            {item.quantity.toFixed(3)} {item.unit || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700 max-w-xs truncate" title={item.remark}>
                            {item.remark || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-slate-50 px-6 py-5 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600 font-medium">
                      Showing <span className="text-slate-900 font-semibold">{startIndex + 1}</span> to{' '}
                      <span className="text-slate-900 font-semibold">
                        {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)}
                      </span>{' '}
                      of <span className="text-slate-900 font-semibold">{filteredItems.length}</span> results
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all disabled:hover:bg-white shadow-sm hover:shadow"
                      >
                        Previous
                      </button>

                      <div className="hidden sm:flex items-center space-x-1">
                        {getPageNumbers().map(pageNum => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`min-w-[40px] px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <div className="sm:hidden px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg">
                        {currentPage} / {totalPages}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all disabled:hover:bg-white shadow-sm hover:shadow"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}