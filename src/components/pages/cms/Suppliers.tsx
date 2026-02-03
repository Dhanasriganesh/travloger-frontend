import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchApi, handleApiError } from '../../../lib/api'
import ErrorBoundary from '../../ErrorBoundary'

interface Supplier {
  id: number
  supplier_code?: string
  state?: string
  city: string
  company_name?: string
  supplier_name?: string
  contact_person_name?: string
  email: string
  phone_number?: string
  contact_number?: string
  address: string
  country?: string
  whatsapp_number?: string
  gst_number?: string
  pan_number?: string
  bank_name?: string
  bank_account_number?: string
  bank_ifsc_swift?: string
  payment_terms?: string
  contract_start_date?: string
  contract_end_date?: string
  notes?: string
  status?: string
  created_by: string
  date: string
}

const getSupplierDisplayName = (supplier: Supplier): string => {
  return supplier.supplier_name || supplier.company_name || 'Untitled Supplier'
}

const getSupplierPhone = (supplier: Supplier): string | undefined => {
  return supplier.phone_number || supplier.contact_number
}

const Suppliers: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [destinations, setDestinations] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])

  const [formData, setFormData] = useState({
    state: '',
    city: '',
    supplierName: '',
    contactPersonName: '',
    email: '',
    phoneNumber: '',
    address: '',
    country: '',
    whatsappNumber: '',
    gstNumber: '',
    panNumber: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfscSwift: '',
    paymentTerms: '',
    contractStartDate: '',
    contractEndDate: '',
    notes: '',
    status: 'Active',
  })

  useEffect(() => {
    fetchSuppliers()
    fetchStates()
  }, [])

  useEffect(() => {
    if (formData.state) {
      fetchDestinations(formData.state)
    } else {
      setDestinations([])
    }
  }, [formData.state])

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

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await fetchApi('/suppliers')
      setSuppliers(data.suppliers || [])
    } catch (error) {
      console.error('Error fetching suppliers:', handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSupplier = async () => {
    if (!formData.supplierName || !formData.contactPersonName || !formData.phoneNumber) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const method = editingSupplier ? 'PUT' : 'POST'
      const body = editingSupplier
        ? { id: editingSupplier.id, ...formData }
        : formData

      const data = await fetchApi('/suppliers', {
        method,
        body: JSON.stringify(body)
      })

      await fetchSuppliers() // Refresh the list
      setShowAddForm(false)
      setFormData({
        state: '',
        city: '',
        supplierName: '',
        contactPersonName: '',
        email: '',
        phoneNumber: '',
        address: '',
        country: '',
        whatsappNumber: '',
        gstNumber: '',
        panNumber: '',
        bankName: '',
        bankAccountNumber: '',
        bankIfscSwift: '',
        paymentTerms: '',
        contractStartDate: '',
        contractEndDate: '',
        notes: '',
        status: 'Active',
      })
      setEditingSupplier(null)
      alert(data.message || 'Supplier saved successfully')
    } catch (error) {
      console.error('Error saving supplier:', error)
      alert(handleApiError(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSupplier = async (id: number, supplier: Supplier) => {
    if (!confirm(`Are you sure you want to delete "${getSupplierDisplayName(supplier)}"?`)) {
      return
    }

    try {
      const data = await fetchApi(`/suppliers?id=${id}`, {
        method: 'DELETE'
      })

      await fetchSuppliers() // Refresh the list
      alert(data.message || 'Supplier deleted successfully')
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert(handleApiError(error))
    }
  }

  const handleEditClick = async (supplier: Supplier) => {
    setEditingSupplier(supplier)
    const stateValue = (supplier as any).state || ''
    setFormData({
      state: stateValue,
      city: supplier.city || '',
      supplierName: getSupplierDisplayName(supplier) || '',
      contactPersonName: supplier.contact_person_name || '',
      email: supplier.email || '',
      phoneNumber: getSupplierPhone(supplier) || '',
      address: supplier.address || '',
      country: supplier.country || '',
      whatsappNumber: supplier.whatsapp_number || '',
      gstNumber: supplier.gst_number || '',
      panNumber: supplier.pan_number || '',
      bankName: supplier.bank_name || '',
      bankAccountNumber: supplier.bank_account_number || '',
      bankIfscSwift: supplier.bank_ifsc_swift || '',
      paymentTerms: supplier.payment_terms || '',
      contractStartDate: supplier.contract_start_date || '',
      contractEndDate: supplier.contract_end_date || '',
      notes: supplier.notes || '',
      status: supplier.status || 'Active',
    })
    // Fetch destinations for the selected state
    if (stateValue) {
      await fetchDestinations(stateValue)
    }
    setShowAddForm(true)
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingSupplier(null)
    setFormData({
      state: '',
      city: '',
      supplierName: '',
      contactPersonName: '',
      email: '',
      phoneNumber: '',
      address: '',
      country: '',
      whatsappNumber: '',
      gstNumber: '',
      panNumber: '',
      bankName: '',
      bankAccountNumber: '',
      bankIfscSwift: '',
      paymentTerms: '',
      contractStartDate: '',
      contractEndDate: '',
      notes: '',
      status: 'Active',
    })
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const search = searchTerm.toLowerCase()
    const company = getSupplierDisplayName(supplier).toLowerCase()
    const contact = supplier.contact_person_name?.toLowerCase() || ''
    const code = supplier.supplier_code?.toLowerCase() || ''
    return company.includes(search) || contact.includes(search) || code.includes(search)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/settings/admin')}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span className="text-xs">Back to Admin Settings</span>
                </button>
                <h1 className="text-lg font-bold text-gray-900">Suppliers</h1>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-40 h-8"
                  />
                </div>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Supplier
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="w-40 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                      <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                      <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 text-sm font-semibold text-gray-900 truncate">
                          {supplier.supplier_code || 'Auto'}
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-gray-900 truncate">
                          {getSupplierDisplayName(supplier)}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 truncate">{supplier.email}</td>
                        <td className="px-3 py-4 text-sm text-gray-900 truncate">
                          {getSupplierPhone(supplier) || '—'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 truncate">
                          {supplier.city}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">T</span>
                            </div>
                            <span className="text-xs truncate">{supplier.created_by}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {supplier.date}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEditClick(supplier)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit supplier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.id, supplier)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete supplier"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Total Records */}
          <div className="mt-4 text-sm text-gray-600">
            Total Records: {filteredSuppliers.length}
          </div>
        </div>

        {/* Add Supplier Form Panel */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 backdrop-blur-sm"
              onClick={() => setShowAddForm(false)}
            />

            {/* Sliding Panel */}
            <div className="absolute right-0 top-0 h-full w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
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
                <div className="flex-1 p-6 overflow-y-auto">
                  <form className="space-y-4">
                    {editingSupplier && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Code</label>
                        <Input
                          type="text"
                          value={editingSupplier.supplier_code || 'Auto generated'}
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Codes are generated automatically based on supplier type & destination.
                        </p>
                      </div>
                    )}

                    {!editingSupplier && (
                      <p className="text-xs text-gray-500">
                        Supplier codes are generated automatically when you save this form.
                      </p>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.state}
                        onChange={(e) => {
                          setFormData({ ...formData, state: e.target.value, city: '' })
                        }}
                      >
                        <option value="">Select state</option>
                        {states.filter(s => s.status === 'Active').map(state => (
                          <option key={state.id} value={state.name}>{state.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destination
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={!formData.state}
                      >
                        <option value="">{formData.state ? 'Select destination' : 'Select state first'}</option>
                        {destinations.map(dest => (
                          <option key={dest.id || dest.name} value={dest.name || dest}>{dest.name || dest}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                      <Input
                        type="text"
                        className="border-l-2 border-red-500"
                        placeholder="Enter supplier name"
                        value={formData.supplierName}
                        onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
                      <Input
                        type="text"
                        className="border-l-2 border-red-500"
                        placeholder="Enter contact person name"
                        value={formData.contactPersonName}
                        onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <Input
                          type="tel"
                          className="border-l-2 border-red-500"
                          placeholder="Enter phone number"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                        <Input
                          type="tel"
                          placeholder="Enter WhatsApp number"
                          value={formData.whatsappNumber}
                          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        className="border-l-2 border-red-500"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                        <Input
                          type="text"
                          placeholder="Enter GST number"
                          value={formData.gstNumber}
                          onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                        <Input
                          type="text"
                          placeholder="Enter PAN number"
                          value={formData.panNumber}
                          onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Details</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          placeholder="Bank Name"
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        />
                        <Input
                          type="text"
                          placeholder="Account Number"
                          value={formData.bankAccountNumber}
                          onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                        />
                        <Input
                          type="text"
                          placeholder="IFSC / SWIFT"
                          value={formData.bankIfscSwift}
                          onChange={(e) => setFormData({ ...formData, bankIfscSwift: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <Input
                          type="text"
                          placeholder="Enter country"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                      <Input
                        type="text"
                        placeholder="e.g., 50% advance, balance on checkout"
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contract Start Date</label>
                        <Input
                          type="date"
                          value={formData.contractStartDate}
                          onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contract End Date</label>
                        <Input
                          type="date"
                          value={formData.contractEndDate}
                          onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Special conditions, credit info, etc."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCloseForm}
                      className="flex-1"
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveSupplier}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : (editingSupplier ? 'Update' : 'Save')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default Suppliers

