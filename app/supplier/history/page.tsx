// app/suppliers/history/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react'

interface Supplier {
  id?: number
  name: string
  address: string
  remarks: string
  created_at?: string
  updated_at?: string
}

export default function SuppliersHistoryPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    remarks: ''
  })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/suppliers')
      const result = await response.json()
      
      if (response.ok) {
        setSuppliers(result.data || [])
      } else {
        setMessage({ text: result.error || 'Failed to fetch suppliers', type: 'error' })
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setMessage({ text: 'Failed to fetch suppliers', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Load suppliers on component mount
  useEffect(() => {
    fetchSuppliers()
  }, [])

  // Handle edit
  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      address: supplier.address,
      remarks: supplier.remarks
    })
    setEditingId(supplier.id || null)
    setMessage({ text: '', type: '' })
  }

  // Handle form submission for update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    
    setLoading(true)
    
    try {
      const body = { id: editingId, ...formData }

      const response = await fetch('/api/suppliers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ 
          text: 'Supplier updated successfully!', 
          type: 'success' 
        })
        setFormData({ name: '', address: '', remarks: '' })
        setEditingId(null)
        fetchSuppliers() // Refresh the list
      } else {
        setMessage({ text: result.error || 'Failed to update supplier', type: 'error' })
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
      setMessage({ text: 'Failed to update supplier', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this supplier?')) {
      return
    }

    setDeletingId(id)
    
    try {
      const response = await fetch(`/api/suppliers?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ text: 'Supplier deleted successfully!', type: 'success' })
        fetchSuppliers() // Refresh the list
      } else {
        setMessage({ text: result.error || 'Failed to delete supplier', type: 'error' })
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      setMessage({ text: 'Failed to delete supplier', type: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  // Cancel edit
  const handleCancel = () => {
    setFormData({ name: '', address: '', remarks: '' })
    setEditingId(null)
    setMessage({ text: '', type: '' })
  }

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/suppliers/add')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Add New Supplier</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Suppliers History</h1>
              <p className="text-slate-600 text-lg">View, edit, and manage existing suppliers</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          {/* Message Display */}
          {message.text && (
            <div className={`mx-6 mt-4 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Edit Form - Shown when editing */}
          {editingId && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Supplier</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter supplier name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter supplier address"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks *
                    </label>
                    <input
                      type="text"
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Consumables, Equipment, etc."
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Supplier'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Suppliers Table */}
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SL No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Loading suppliers...
                      </td>
                    </tr>
                  ) : suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No suppliers found. <button onClick={() => router.push('/suppliers/add')} className="text-blue-600 hover:underline">Add your first supplier</button>.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((supplier, index) => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {supplier.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {supplier.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {supplier.remarks}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="text-blue-600 hover:text-blue-900 mr-3 flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id!)}
                            disabled={deletingId === supplier.id}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deletingId === supplier.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}