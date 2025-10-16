// app/suppliers/add/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Plus, RotateCcw, CheckCircle, AlertCircle, Info, Sparkles, ChevronDown } from 'lucide-react'

interface Supplier {
  id?: number
  name: string
  address: string
  remarks: string
  created_at?: string
  updated_at?: string
}

export default function AddSupplierPage() {
  const router = useRouter()
  const [newSupplier, setNewSupplier] = useState<Supplier>({ name: '', address: '', remarks: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Create a new supplier
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSupplier),
      })

      const result = await response.json()

      if (response.ok) {
        // Success: Show message, reset form, and redirect
        setSuccess(true)
        setNewSupplier({ name: '', address: '', remarks: '' })
        setTimeout(() => {
          router.push('/suppliers/history')
        }, 2000)
      } else {
        // Handle API errors
        setError(result.error || 'Failed to create supplier')
      }
    } catch (error) {
      console.error('Create supplier error:', error)
      setError('Network error: Unable to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setNewSupplier({ name: '', address: '', remarks: '' })
    setError(null)
    setSuccess(false)
    setFocusedField(null)
  }

  const isFormValid = newSupplier.name.trim() && newSupplier.address.trim() && newSupplier.remarks.trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/suppliers/history')}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Suppliers</span>
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">Add New Supplier</h1>
                <p className="text-slate-600 text-lg">Expand your supplier network</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                  <div className="flex items-center gap-3">
                    <Plus className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">Supplier Information</h2>
                  </div>
                </div>

                <div className="p-8">
                  {/* Success Message */}
                  {success && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">Success!</p>
                          <p className="text-green-700 text-sm">Supplier created successfully. Redirecting...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-semibold text-red-800">Error</p>
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Supplier Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                        Supplier Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="name"
                          type="text"
                          placeholder="Enter supplier name"
                          value={newSupplier.name}
                          onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white/50 backdrop-blur-sm
                            ${focusedField === 'name' 
                              ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg' 
                              : 'border-slate-200 hover:border-slate-300'
                            }
                            focus:outline-none text-slate-800 placeholder-slate-400`}
                        />
                        {newSupplier.name && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <label htmlFor="address" className="block text-sm font-semibold text-slate-700">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="address"
                          type="text"
                          placeholder="Enter supplier address"
                          value={newSupplier.address}
                          onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                          onFocus={() => setFocusedField('address')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white/50 backdrop-blur-sm
                            ${focusedField === 'address' 
                              ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg' 
                              : 'border-slate-200 hover:border-slate-300'
                            }
                            focus:outline-none text-slate-800 placeholder-slate-400`}
                        />
                        {newSupplier.address && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="space-y-2">
                      <label htmlFor="remarks" className="block text-sm font-semibold text-slate-700">
                        Remarks <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          id="remarks"
                          placeholder="e.g., Consumables, Equipment, etc."
                          value={newSupplier.remarks || ''}
                          onChange={(e) => setNewSupplier({ ...newSupplier, remarks: e.target.value })}
                          onFocus={() => setFocusedField('remarks')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none bg-white/50 backdrop-blur-sm
                            ${focusedField === 'remarks' 
                              ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg' 
                              : 'border-slate-200 hover:border-slate-300'
                            }
                            focus:outline-none text-slate-800 placeholder-slate-400`}
                          rows={4}
                        />
                        {newSupplier.remarks && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <button
                        onClick={handleCreate}
                        disabled={loading || !isFormValid}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg
                          ${isFormValid && !loading
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating Supplier...
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            Create Supplier
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleReset}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Reset Form
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips Card */}
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-white">Pro Tips</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-slate-700">Use clear, descriptive names for easy identification</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-slate-700">Provide complete address details for logistics</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-slate-700">Add remarks to categorize suppliers (e.g., types of goods)</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-slate-700">Fields marked with * are required</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Progress */}
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-white">Form Progress</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Name</span>
                      <CheckCircle className={`w-4 h-4 ${newSupplier.name ? 'text-green-500' : 'text-slate-300'}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Address</span>
                      <CheckCircle className={`w-4 h-4 ${newSupplier.address ? 'text-green-500' : 'text-slate-300'}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Remarks</span>
                      <CheckCircle className={`w-4 h-4 ${newSupplier.remarks ? 'text-green-500' : 'text-slate-300'}`} />
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-xs text-slate-600 mb-2">Completion: {Math.round(((newSupplier.name ? 1 : 0) + (newSupplier.address ? 1 : 0) + (newSupplier.remarks ? 1 : 0)) / 3 * 100)}%</div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((newSupplier.name ? 1 : 0) + (newSupplier.address ? 1 : 0) + (newSupplier.remarks ? 1 : 0)) / 3 * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}