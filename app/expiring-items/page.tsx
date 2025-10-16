// app/expiry-tracking/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { ChemicalWithRegistration } from '@/types/database.types';

type FilterType = 'all' | 'expired' | 'week' | 'month' | 'quarter';
type SortField = 'expiry_date' | 'chemical_name' | 'department' | 'quantity';
type SortOrder = 'asc' | 'desc';

export default function ExpiryTrackingPage() {
  const [chemicals, setChemicals] = useState<ChemicalWithRegistration[]>([]);
  const [filteredChemicals, setFilteredChemicals] = useState<ChemicalWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('expiry_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    async function fetchChemicals() {
      try {
        setLoading(true);
        const response = await fetch('/api/expiry-tracking/all-chemicals');
        
        if (!response.ok) {
          throw new Error('Failed to fetch chemicals');
        }

        const data = await response.json();
        setChemicals(data);
        setFilteredChemicals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchChemicals();
  }, []);

  useEffect(() => {
    let filtered = [...chemicals];

    // Apply date filter
    const today = new Date();
    switch (filter) {
      case 'expired':
        filtered = filtered.filter(c => new Date(c.expiry_date) < today);
        break;
      case 'week':
        const weekFromNow = new Date();
        weekFromNow.setDate(today.getDate() + 7);
        filtered = filtered.filter(c => {
          const expiry = new Date(c.expiry_date);
          return expiry >= today && expiry <= weekFromNow;
        });
        break;
      case 'month':
        const monthFromNow = new Date();
        monthFromNow.setDate(today.getDate() + 30);
        filtered = filtered.filter(c => {
          const expiry = new Date(c.expiry_date);
          return expiry >= today && expiry <= monthFromNow;
        });
        break;
      case 'quarter':
        const quarterFromNow = new Date();
        quarterFromNow.setDate(today.getDate() + 90);
        filtered = filtered.filter(c => {
          const expiry = new Date(c.expiry_date);
          return expiry >= today && expiry <= quarterFromNow;
        });
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.chemical_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.registration.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.registration.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'expiry_date':
          aValue = new Date(a.expiry_date).getTime();
          bValue = new Date(b.expiry_date).getTime();
          break;
        case 'chemical_name':
          aValue = a.chemical_name.toLowerCase();
          bValue = b.chemical_name.toLowerCase();
          break;
        case 'department':
          aValue = a.registration.department.toLowerCase();
          bValue = b.registration.department.toLowerCase();
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        default:
          aValue = a.expiry_date;
          bValue = b.expiry_date;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredChemicals(filtered);
  }, [chemicals, filter, searchTerm, sortField, sortOrder]);

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (daysLeft: number) => {
    if (daysLeft < 0) return { text: 'Expired', color: 'bg-red-100 text-red-800', priority: 4 };
    if (daysLeft <= 7) return { text: 'Critical', color: 'bg-orange-100 text-orange-800', priority: 3 };
    if (daysLeft <= 30) return { text: 'Warning', color: 'bg-yellow-100 text-yellow-800', priority: 2 };
    if (daysLeft <= 90) return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800', priority: 1 };
    return { text: 'Good', color: 'bg-green-100 text-green-800', priority: 0 };
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const stats = {
    total: chemicals.length,
    expired: chemicals.filter(c => getDaysUntilExpiry(c.expiry_date) < 0).length,
    critical: chemicals.filter(c => {
      const days = getDaysUntilExpiry(c.expiry_date);
      return days >= 0 && days <= 7;
    }).length,
    warning: chemicals.filter(c => {
      const days = getDaysUntilExpiry(c.expiry_date);
      return days > 7 && days <= 30;
    }).length,
    upcoming: chemicals.filter(c => {
      const days = getDaysUntilExpiry(c.expiry_date);
      return days > 30 && days <= 90;
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chemical expiry data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chemical Expiry Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor and manage chemical expiration dates</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Chemicals</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Expired</p>
            <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Critical (≤7 days)</p>
            <p className="text-3xl font-bold text-orange-600">{stats.critical}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Warning (≤30 days)</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.warning}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Upcoming (≤90 days)</p>
            <p className="text-3xl font-bold text-blue-600">{stats.upcoming}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by chemical name, department, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Expiry Period
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('expired')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'expired'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Expired
                </button>
                <button
                  onClick={() => setFilter('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'week'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setFilter('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'month'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setFilter('quarter')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'quarter'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Quarter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredChemicals.length} of {chemicals.length} chemicals
        </div>

        {/* Chemicals Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort('chemical_name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Chemical Name
                      {getSortIcon('chemical_name')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('department')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Department
                      {getSortIcon('department')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('quantity')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Quantity
                      {getSortIcon('quantity')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store Officer
                  </th>
                  <th 
                    onClick={() => handleSort('expiry_date')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Expiry Date
                      {getSortIcon('expiry_date')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Left
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChemicals.map((chemical) => {
                  const daysLeft = getDaysUntilExpiry(chemical.expiry_date);
                  const status = getExpiryStatus(daysLeft);

                  return (
                    <tr 
                      key={chemical.id} 
                      className={`hover:bg-gray-50 ${daysLeft < 0 ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {chemical.chemical_name}
                        {chemical.remark && (
                          <p className="text-xs text-gray-500 mt-1">{chemical.remark}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {chemical.registration.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {chemical.quantity} {chemical.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {chemical.registration.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {chemical.registration.store_officer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(chemical.expiry_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {daysLeft < 0 ? (
                          <span className="text-red-600">-{Math.abs(daysLeft)}</span>
                        ) : (
                          daysLeft
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredChemicals.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No chemicals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}