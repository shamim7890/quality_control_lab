"use client"

import { useState, useEffect, ChangeEvent, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle, Loader2, Search } from "lucide-react"

export interface ChemicalItem {
  id: string
  chemicalName: string
  quantity: number
  expiryDate: string
  remark: string
  unit: string
}

interface Product {
  id: number;
  name: string;
  unit: string;
  uses?: string | null;
}

interface ChemicalItemRowProps {
  index: number
  item: ChemicalItem
  updateItem: (index: number, updatedItem: ChemicalItem) => void
  removeItem: (index: number) => void
  errors: Record<string, string>
  products: Product[]
  isLoadingProducts: boolean
}

export function ChemicalItemRow({ 
  index, 
  item, 
  updateItem, 
  removeItem, 
  errors, 
  products, 
  isLoadingProducts 
}: ChemicalItemRowProps) {
  const [localItem, setLocalItem] = useState<ChemicalItem>(item)
  
  // Search related states
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalItem(item)
    setSearchTerm(item.chemicalName || "")
  }, [item])

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([])
      return
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.uses && product.uses.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredProducts(filtered)
    setSelectedIndex(-1)
  }, [searchTerm, products])

  const handleFieldUpdate = (updatedFields: Partial<ChemicalItem>) => {
    const updatedItem = { 
      ...localItem, 
      ...updatedFields
    }
    setLocalItem(updatedItem)
    updateItem(index, updatedItem)
  }

  // Updated product selection handler to include unit
  const handleProductSelect = useCallback((product: Product) => {
    setSearchTerm(product.name)
    handleFieldUpdate({ 
      chemicalName: product.name,
      unit: product.unit  // Auto-fill the unit from selected product
    })
    setShowDropdown(false)
    setSelectedIndex(-1)
  }, [handleFieldUpdate])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown || filteredProducts.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredProducts.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
            handleProductSelect(filteredProducts[selectedIndex])
          }
          break
        case 'Escape':
          setShowDropdown(false)
          setSelectedIndex(-1)
          break
      }
    }

    if (showDropdown) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showDropdown, filteredProducts, selectedIndex, handleProductSelect])

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const finalValue = type === 'number' ? parseFloat(value) || 0 : value
    
    if (name === 'quantity') {
      handleFieldUpdate({ [name]: finalValue as number })
    } else {
      handleFieldUpdate({ [name]: finalValue as string })
    }
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowDropdown(true)
    
    // Update the chemical name in real-time for custom entries
    handleFieldUpdate({ chemicalName: value })
  }

  const handleSearchFocus = () => {
    if (filteredProducts.length > 0 || searchTerm.trim()) {
      setShowDropdown(true)
    }
  }

  const handleRemove = () => {
    removeItem(index)
  }

  // Handle inline remark editing
  const handleRemarkChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    handleFieldUpdate({ remark: value })
  }

  // Check if chemical is expired or expiring soon
  const isExpired = () => {
    if (!localItem.expiryDate) return false
    const today = new Date()
    const expiry = new Date(localItem.expiryDate)
    return expiry < today
  }

  const isExpiringSoon = () => {
    if (!localItem.expiryDate) return false
    const today = new Date()
    const expiry = new Date(localItem.expiryDate)
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    return expiry <= thirtyDaysFromNow && expiry >= today
  }

  const getExpiryStatus = () => {
    if (isExpired()) return { color: "text-red-600", bg: "bg-red-50", text: "EXPIRED" }
    if (isExpiringSoon()) return { color: "text-yellow-600", bg: "bg-yellow-50", text: "EXPIRING SOON" }
    return { color: "text-green-600", bg: "bg-green-50", text: "VALID" }
  }

  const expiryStatus = getExpiryStatus()

  // Get selected product details
  const selectedProduct = products.find(p => p.name === localItem.chemicalName)
  // Check if unit was auto-filled from product selection
  const isUnitFromProduct = selectedProduct && selectedProduct.unit === localItem.unit

  return (
    <>
      <tr className={`border-b hover:bg-gray-50 transition-colors ${errors && Object.keys(errors).length > 0 ? "bg-red-50" : ""} ${isExpired() ? "bg-red-50" : isExpiringSoon() ? "bg-yellow-50" : ""}`}>
        <td className="px-4 py-3 text-center font-medium text-gray-600">{index + 1}</td>

        {/* Chemical Name - Search Input */}
        <td className="px-4 py-3">
          <div ref={searchContainerRef} className="space-y-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={isLoadingProducts ? "Loading products..." : "Search or enter chemical name..."}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                disabled={isLoadingProducts}
                className={`pl-10 ${errors.chemicalName ? 'border-red-500' : ''}`}
              />
              {isLoadingProducts && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400 z-10" />
              )}
            </div>

            {/* Dropdown - Fixed z-index and positioning */}
            {showDropdown && !isLoadingProducts && (
              <div
                ref={dropdownRef}
                className="fixed bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto"
                style={{
                  zIndex: 9999,
                  top: searchContainerRef.current 
                    ? searchContainerRef.current.getBoundingClientRect().bottom + window.scrollY + 4
                    : 'auto',
                  left: searchContainerRef.current 
                    ? searchContainerRef.current.getBoundingClientRect().left + window.scrollX
                    : 'auto',
                  width: searchContainerRef.current 
                    ? searchContainerRef.current.getBoundingClientRect().width
                    : 'auto',
                  minWidth: '300px'
                }}
              >
                {filteredProducts.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {searchTerm.trim() ? "No products found. You can still enter a custom chemical name." : "Start typing to search products..."}
                  </div>
                ) : (
                  filteredProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                        idx === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                      }`}
                      onClick={() => handleProductSelect(product)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">{product.name}</span>
                        <span className="text-xs text-gray-500">
                          Unit: {product.unit}
                          {product.uses && ` • ${product.uses}`}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {/* Show selected product info */}
            {selectedProduct && (
              <div className="text-xs text-gray-500">
                {selectedProduct.uses && (
                  <span className="block">Uses: {selectedProduct.uses}</span>
                )}
              </div>
            )}
            
            {errors.chemicalName && (
              <p className="text-xs text-red-500 mt-1">{errors.chemicalName}</p>
            )}
          </div>
        </td>

        {/* Quantity */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <Input 
              type="number" 
              name="quantity" 
              step="0.01" 
              placeholder="Quantity" 
              value={localItem.quantity || ""} 
              onChange={handleChange}
              className={`flex-1 ${errors.quantity ? "border-red-500" : ""}`}
            />
            {errors.quantity && (
              <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>
            )}
          </div>
        </td>

        {/* Unit - Now shows visual indicator when auto-filled */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <div className="relative">
              <Input 
                type="text" 
                name="unit" 
                placeholder="Unit (e.g., kg, L)" 
                value={localItem.unit || ""} 
                onChange={handleChange}
                className={`w-full ${isUnitFromProduct ? 'bg-green-50 border-green-300' : ''}`}
              />
              {isUnitFromProduct && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-green-600 bg-green-100 px-1 py-0.5 rounded">
                    Auto-filled
                  </span>
                </div>
              )}
            </div>
            {isUnitFromProduct && (
              <p className="text-xs text-green-600">Unit automatically filled from selected product</p>
            )}
          </div>
        </td>

        {/* Expiry Date */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <Input 
              type="date" 
              name="expiryDate" 
              value={localItem.expiryDate || ""} 
              onChange={handleChange}
              className={errors.expiryDate ? "border-red-500" : ""}
            />
            {localItem.expiryDate && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${expiryStatus.bg} ${expiryStatus.color}`}>
                {(isExpired() || isExpiringSoon()) && <AlertTriangle size={12} />}
                {expiryStatus.text}
              </div>
            )}
          </div>
          {errors.expiryDate && (
            <p className="text-xs text-red-500 mt-1">{errors.expiryDate}</p>
          )}
        </td>

        {/* Remark */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <Input
              type="text"
              name="remark"
              placeholder="Enter remarks..."
              value={localItem.remark || ""}
              onChange={handleRemarkChange}
              className="w-full"
            />
          </div>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove} 
            className="text-red-500 hover:text-red-700"
            title="Remove this chemical"
          >
            <X size={16} />
          </Button>
        </td>
      </tr>
    </>
  )
}