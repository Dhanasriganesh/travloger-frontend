import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Plus, Search, Edit, Trash2, ArrowLeft, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchApi, handleApiError } from '../../../lib/api'
import ErrorBoundary from '../../ErrorBoundary'

interface State {
  id: number
  name: string
  code: string
  country: string
  status: string
  description: string
  created_by: string
  date: string
}

const States: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [states, setStates] = useState<State[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingState, setEditingState] = useState<State | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: 'India',
    status: 'Active',
    description: ''
  })

  useEffect(() => {
    fetchStates()
  }, [])

  const fetchStates = async () => {
    try {
      setLoading(true)
      const data = await fetchApi('/api/states')
      setStates(data.states || [])
    } catch (error) {
      console.error('Error fetching states:', handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveState = async () => {
    if (!formData.name.trim()) {
      alert('Please enter state name')
      return
    }

    try {
      setSaving(true)
      const method = editingState ? 'PUT' : 'POST'
      const body = editingState
        ? { id: editingState.id, ...formData }
        : formData

      const data = await fetchApi('/api/states', {
        method,
        body: JSON.stringify(body)
      })

      await fetchStates()
      setShowAddForm(false)
      setFormData({
        name: '',
        code: '',
        country: 'India',
        status: 'Active',
        description: ''
      })
      setEditingState(null)
      alert(data.message || 'State saved successfully')
    } catch (error) {
      console.error('Error saving state:', error)
      alert(handleApiError(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteState = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const data = await fetchApi(`/api/states?id=${id}`, {
        method: 'DELETE'
      })

      await fetchStates()
      alert(data.message || 'State deleted successfully')
    } catch (error) {
      console.error('Error deleting state:', error)
      alert(handleApiError(error))
    }
  }

  const handleEditClick = (state: State) => {
    setEditingState(state)
    setFormData({
      name: state.name,
      code: state.code || '',
      country: state.country || 'India',
      status: state.status,
      description: state.description || ''
    })
    setShowAddForm(true)
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingState(null)
    setFormData({
      name: '',
      code: '',
      country: 'India',
      status: 'Active',
      description: ''
    })
  }

  const filteredStates = states.filter(state => {
    const name = state.name?.toLowerCase() || ''
    const code = state.code?.toLowerCase() || ''
    return name.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading states...</p>
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
                <h1 className="text-lg font-bold text-gray-900">State Master</h1>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    type="text"
                    placeholder="Search by name or code"
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
                Add State
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
                      <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State Name</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                      <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStates.map((state) => (
                      <tr key={state.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 text-sm font-medium text-gray-900 truncate">{state.name}</td>
                        <td className="px-3 py-4 text-sm text-gray-900 truncate">{state.code || '-'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900 truncate">{state.country}</td>
                        <td className="px-3 py-4 text-sm">
                          <Badge variant={state.status === 'Active' ? 'default' : 'secondary'}>
                            {state.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">T</span>
                            </div>
                            <span className="text-xs truncate">{state.created_by}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {state.date}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEditClick(state)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit state"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteState(state.id, state.name)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete state"
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
            Total Records: {filteredStates.length}
          </div>
        </div>

        {/* Add State Form Panel */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 backdrop-blur-sm"
              onClick={handleCloseForm}
            />

            {/* Sliding Panel */}
            <div className="absolute right-0 top-0 h-full w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingState ? 'Edit State' : 'Add State'}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        className="border-l-2 border-red-500"
                        placeholder="Enter state name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Code
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter state code (e.g., MH, KA, DL)"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        maxLength={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional: 2-3 letter code (e.g., MH for Maharashtra)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Optional description or notes"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      onClick={handleSaveState}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : (editingState ? 'Update' : 'Save')}
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

export default States

