import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchApi, handleApiError } from '../../../lib/api'
import ErrorBoundary from '../../ErrorBoundary'

interface VehiclePackageRate {
  id: number
  status: string
  state: string
  from_destination: string
  to_destination: string
  package_code: string
  package_name: string
  duration_trip_type: string
  vehicle_type: string
  min_pax: number
  max_pax: number
  supplier_code: string
  supplier_name: string
  cost_price: number
  default_selling_price: number
  valid_from: string
  valid_to: string
  remarks_notes: string
  created_by: string
  date: string
}

const VehiclePackageRates: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [rates, setRates] = useState<VehiclePackageRate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingRate, setEditingRate] = useState<VehiclePackageRate | null>(null)
  
  const [states, setStates] = useState<any[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    status: 'Active',
    state: '',
    fromDestination: '',
    toDestination: '',
    packageCode: '',
    packageName: '',
    durationTripType: '',
    vehicleType: '',
    minPax: 1,
    maxPax: 4,
    supplierCode: '',
    supplierName: '',
    costPrice: 0,
    defaultSellingPrice: 0,
    validFrom: '',
    validTo: '',
    remarksNotes: ''
  })

  useEffect(() => {
    fetchRates()
    fetchStates()
    fetchVehicleTypes()
    fetchSuppliers()
  }, [])

  useEffect(() => {
    if (formData.state) {
      fetchDestinations(formData.state)
    } else {
      setDestinations([])
    }
  }, [formData.state])

  useEffect(() => {
    // Auto-fill supplier name when supplier code changes
    if (formData.supplierCode) {
      const supplier = suppliers.find(s => s.supplier_code === formData.supplierCode)
      if (supplier) {
        setFormData(prev => ({
          ...prev,
          supplierName: supplier.supplier_name || supplier.company_name || ''
        }))
      }
    } else {
      setFormData(prev => ({ ...prev, supplierName: '' }))
    }
  }, [formData.supplierCode, suppliers])

  const fetchStates = async () => {
    try {
      const data = await fetchApi('/api/states')
      setStates(data.states || [])
    } catch (error) {
      console.error('Error fetching states:', handleApiError(error))
    }
  }

  const fetchDestinations = async (state?: string) => {
    try {
      const url = state ? `/api/destinations?state=${encodeURIComponent(state)}` : '/api/destinations'
      const data = await fetchApi(url)
      setDestinations(data.destinations || [])
    } catch (error) {
      console.error('Error fetching destinations:', handleApiError(error))
      setDestinations([])
    }
  }

  const fetchVehicleTypes = async () => {
    try {
      const data = await fetchApi('/api/vehicle-types')
      setVehicleTypes(data.vehicleTypes || [])
    } catch (error) {
      console.error('Error fetching vehicle types:', handleApiError(error))
    }
  }

  const fetchSuppliers = async () => {
    try {
      const data = await fetchApi('/api/suppliers')
      setSuppliers(data.suppliers || [])
    } catch (error) {
      console.error('Error fetching suppliers:', handleApiError(error))
    }
  }

  const fetchRates = async () => {
    try {
      setLoading(true)
      const data = await fetchApi('/api/vehicle-package-rates')
      setRates(data.vehiclePackageRates || [])
    } catch (error) {
      console.error('Error fetching vehicle package rates:', handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRate = async () => {
    if (!formData.packageCode.trim()) {
      alert('Please enter package code')
      return
    }
    if (!formData.state) {
      alert('Please select state')
      return
    }
    if (!formData.fromDestination) {
      alert('Please select from destination')
      return
    }
    if (!formData.toDestination) {
      alert('Please select to destination')
      return
    }
    if (!formData.vehicleType) {
      alert('Please select vehicle type')
      return
    }
    if (!formData.supplierCode) {
      alert('Please select supplier code')
      return
    }

    try {
      setSaving(true)
      const method = editingRate ? 'PUT' : 'POST'
      const body = editingRate 
        ? { id: editingRate.id, ...formData }
        : formData

      const data = await fetchApi('/api/vehicle-package-rates', {
        method,
        body: JSON.stringify(body)
      })

      await fetchRates()
      setShowAddForm(false)
      setFormData({
        status: 'Active',
        state: '',
        fromDestination: '',
        toDestination: '',
        packageCode: '',
        packageName: '',
        durationTripType: '',
        vehicleType: '',
        minPax: 1,
        maxPax: 4,
        supplierCode: '',
        supplierName: '',
        costPrice: 0,
        defaultSellingPrice: 0,
        validFrom: '',
        validTo: '',
        remarksNotes: ''
      })
      setEditingRate(null)
      alert(data.message || 'Vehicle package rate saved successfully')
    } catch (error) {
      console.error('Error saving vehicle package rate:', error)
      alert(handleApiError(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRate = async (id: number, packageCode: string) => {
    if (!confirm(`Are you sure you want to delete rate for package code "${packageCode}"?`)) {
      return
    }

    try {
      const data = await fetchApi(`/api/vehicle-package-rates?id=${id}`, {
        method: 'DELETE'
      })

      await fetchRates()
      alert(data.message || 'Vehicle package rate deleted successfully')
    } catch (error) {
      console.error('Error deleting vehicle package rate:', error)
      alert(handleApiError(error))
    }
  }

  const handleEditClick = async (rate: VehiclePackageRate) => {
    setEditingRate(rate)
    setFormData({
      status: rate.status || 'Active',
      state: rate.state || '',
      fromDestination: rate.from_destination || '',
      toDestination: rate.to_destination || '',
      packageCode: rate.package_code || '',
      packageName: rate.package_name || '',
      durationTripType: rate.duration_trip_type || '',
      vehicleType: rate.vehicle_type || '',
      minPax: rate.min_pax || 1,
      maxPax: rate.max_pax || 4,
      supplierCode: rate.supplier_code || '',
      supplierName: rate.supplier_name || '',
      costPrice: rate.cost_price || 0,
      defaultSellingPrice: rate.default_selling_price || 0,
      validFrom: rate.valid_from || '',
      validTo: rate.valid_to || '',
      remarksNotes: rate.remarks_notes || ''
    })
    // Fetch destinations for the selected state
    if (rate.state) {
      await fetchDestinations(rate.state)
    }
    setShowAddForm(true)
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingRate(null)
    setFormData({
      status: 'Active',
      state: '',
      fromDestination: '',
      toDestination: '',
      packageCode: '',
      packageName: '',
      durationTripType: '',
      vehicleType: '',
      minPax: 1,
      maxPax: 4,
      supplierCode: '',
      supplierName: '',
      costPrice: 0,
      defaultSellingPrice: 0,
      validFrom: '',
      validTo: '',
      remarksNotes: ''
    })
  }

  const filteredRates = rates.filter(rate =>
    rate.package_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.from_destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.to_destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.supplier_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading vehicle package rates...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/settings/admin')}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Back to Settings</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900">Vehicle Package Rate Master</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search rates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Rate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Code</th>
                      <th className="w-40 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Name</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pax</th>
                      <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling</th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRates.map((rate) => (
                      <tr key={rate.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 text-sm">
                          <Badge variant={rate.status === 'Active' ? 'default' : 'secondary'}>
                            {rate.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">{rate.state || '-'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900">{rate.from_destination || '-'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900">{rate.to_destination || '-'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900 font-mono">{rate.package_code || '-'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900 truncate">{rate.package_name || '-'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900">{rate.duration_trip_type || '-'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900">{rate.vehicle_type || '-'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {rate.min_pax}-{rate.max_pax}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <div className="truncate" title={rate.supplier_name || rate.supplier_code}>
                            {rate.supplier_code || '-'}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">₹{rate.cost_price || 0}</td>
                        <td className="px-3 py-4 text-sm text-gray-900">₹{rate.default_selling_price || 0}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <button
                            onClick={() => handleEditClick(rate)}
                            className="hover:text-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteRate(rate.id, rate.package_code)}
                            className="hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-sm text-gray-600">
            Total Records: {filteredRates.length}
          </div>
        </div>

        {/* Add/Edit Form Panel */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 backdrop-blur-sm"
              onClick={handleCloseForm}
            />
            
            <div className="absolute right-0 top-0 h-full w-[600px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingRate ? 'Edit Vehicle Package Rate' : 'Add Vehicle Package Rate'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Form */}
                <div className="flex-1 p-6">
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.state}
                          onChange={(e) => {
                            setFormData({...formData, state: e.target.value, fromDestination: '', toDestination: ''})
                          }}
                        >
                          <option value="">Select state</option>
                          {states.filter(s => s.status === 'Active').map(state => (
                            <option key={state.id} value={state.name}>{state.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Destination <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.fromDestination}
                          onChange={(e) => setFormData({...formData, fromDestination: e.target.value})}
                          disabled={!formData.state}
                        >
                          <option value="">{formData.state ? 'Select from destination' : 'Select state first'}</option>
                          {destinations.map(dest => (
                            <option key={dest.id || dest.name} value={dest.name || dest}>{dest.name || dest}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To Destination <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.toDestination}
                          onChange={(e) => setFormData({...formData, toDestination: e.target.value})}
                          disabled={!formData.state}
                        >
                          <option value="">{formData.state ? 'Select to destination' : 'Select state first'}</option>
                          {destinations.map(dest => (
                            <option key={dest.id || dest.name} value={dest.name || dest}>{dest.name || dest}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Package Code <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., HBL-GOK-2N3D"
                          value={formData.packageCode}
                          onChange={(e) => setFormData({...formData, packageCode: e.target.value})}
                          className="font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Package Name
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., 3D/2N Gokarna – Hubli Pickup & Drop"
                          value={formData.packageName}
                          onChange={(e) => setFormData({...formData, packageName: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration / Trip Type
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., 2N3D, 3N4D"
                          value={formData.durationTripType}
                          onChange={(e) => setFormData({...formData, durationTripType: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vehicle Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                        >
                          <option value="">Select vehicle type</option>
                          {vehicleTypes.filter(vt => vt.status === 'Active').map(vt => (
                            <option key={vt.id} value={vt.vehicle_type}>{vt.vehicle_type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Pax
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.minPax}
                          onChange={(e) => setFormData({...formData, minPax: parseInt(e.target.value) || 1})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Pax
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.maxPax}
                          onChange={(e) => setFormData({...formData, maxPax: parseInt(e.target.value) || 4})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier Code <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.supplierCode}
                          onChange={(e) => setFormData({...formData, supplierCode: e.target.value})}
                        >
                          <option value="">Select supplier code</option>
                          {suppliers.filter(s => s.status === 'Active' && s.supplier_code).map(supplier => (
                            <option key={supplier.id} value={supplier.supplier_code}>
                              {supplier.supplier_code} - {supplier.supplier_name || supplier.company_name || 'N/A'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier Name (Auto-filled)
                        </label>
                        <Input
                          type="text"
                          value={formData.supplierName}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cost Price (Vendor Rate)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.costPrice}
                          onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Selling Price
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.defaultSellingPrice}
                          onChange={(e) => setFormData({...formData, defaultSellingPrice: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valid From
                        </label>
                        <Input
                          type="date"
                          value={formData.validFrom}
                          onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valid To
                        </label>
                        <Input
                          type="date"
                          value={formData.validTo}
                          onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks / Notes
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        placeholder="Route notes, inclusions, exclusions..."
                        value={formData.remarksNotes}
                        onChange={(e) => setFormData({...formData, remarksNotes: e.target.value})}
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        onClick={handleSaveRate}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : (editingRate ? 'Update' : 'Save')}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCloseForm}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default VehiclePackageRates


