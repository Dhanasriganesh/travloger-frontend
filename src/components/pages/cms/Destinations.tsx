import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Plus, Search, Edit, Trash2, ArrowLeft, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Destination {
  id: number
  name: string
  status: string
  state: string
  country: string
  description: string
  best_season: string
  default_currency: string
  timezone: string
  created_by: string
  date: string
}

const Destinations: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [states, setStates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active',
    state: '',
    country: '',
    description: '',
    best_season: '',
    default_currency: 'INR',
    timezone: 'Asia/Kolkata'
  })

  useEffect(() => {
    fetchDestinations()
    fetchStates()
  }, [])

  const fetchStates = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/states`)
      const data = await response.json()
      
      if (response.ok) {
        setStates(data.states || [])
      }
    } catch (error) {
      console.error('Error fetching states:', error)
    }
  }

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/destinations`)
      const data = await response.json()
      
      if (response.ok) {
        setDestinations(data.destinations || [])
      } else {
        console.error('Failed to fetch destinations:', data.error)
        alert('Failed to fetch destinations: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error fetching destinations:', error)
      alert('Error fetching destinations. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDestination = async () => {
    if (!formData.name.trim()) {
      alert('Please enter destination name')
      return
    }

    try {
      setSaving(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const method = editingDestination ? 'PUT' : 'POST'
      const body = editingDestination 
        ? { id: editingDestination.id, ...formData }
        : formData

      const response = await fetch(`${API_URL}/api/destinations`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        await fetchDestinations()
        setShowAddForm(false)
        setFormData({ 
          name: '', 
          status: 'Active', 
          state: '', 
          country: '', 
          description: '', 
          best_season: '', 
          default_currency: 'INR', 
          timezone: 'Asia/Kolkata' 
        })
        setEditingDestination(null)
        alert(data.message || 'Destination saved successfully')
      } else {
        alert('Error saving destination: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving destination:', error)
      alert('Error saving destination. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDestination = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/destinations?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        await fetchDestinations()
        alert(data.message || 'Destination deleted successfully')
      } else {
        alert('Error deleting destination: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting destination:', error)
      alert('Error deleting destination. Please try again.')
    }
  }

  const handleEditClick = (destination: Destination) => {
    setEditingDestination(destination)
    setFormData({
      name: destination.name,
      status: destination.status,
      state: destination.state || '',
      country: destination.country || '',
      description: destination.description || '',
      best_season: destination.best_season || '',
      default_currency: destination.default_currency || 'INR',
      timezone: destination.timezone || 'Asia/Kolkata'
    })
    setShowAddForm(true)
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingDestination(null)
    setFormData({ 
      name: '', 
      status: 'Active', 
      state: '', 
      country: '', 
      description: '', 
      best_season: '', 
      default_currency: 'INR', 
      timezone: 'Asia/Kolkata' 
    })
  }

  const filteredDestinations = destinations.filter(destination =>
    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading destinations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                <span className="text-xs">Back to Settings</span>
              </button>
              <h1 className="text-lg font-bold text-gray-900">Destinations Master</h1>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                <Input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-48 h-8"
                />
              </div>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Destination
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                    <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                    <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Season</th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                    <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDestinations.map((destination) => (
                    <tr key={destination.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 text-sm text-gray-900">
                        <MapPin className="h-5 w-5 text-blue-500" />
                      </td>
                      <td className="px-3 py-4 text-sm font-medium text-gray-900 truncate" title={destination.name}>
                        {destination.name}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 truncate" title={destination.state}>
                        {destination.state || '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 truncate" title={destination.country}>
                        {destination.country || '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 truncate" title={destination.best_season}>
                        {destination.best_season || '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {destination.default_currency || 'INR'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        <Badge 
                          variant={destination.status === 'Active' ? 'success' : 'secondary'}
                          className={destination.status === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}
                        >
                          {destination.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">T</span>
                          </div>
                          <span className="text-xs truncate">{destination.created_by}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {destination.date}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <button 
                          onClick={() => handleEditClick(destination)}
                          className="hover:text-gray-700"
                          title="Edit destination"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <button 
                          onClick={() => handleDeleteDestination(destination.id, destination.name)}
                          className="hover:text-red-600"
                          title="Delete destination"
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
          Total Records: {filteredDestinations.length}
        </div>
      </div>

      {/* Add/Edit Destination Form Panel */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            onClick={handleCloseForm}
          />
          
          <div className="absolute right-0 top-0 h-full w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingDestination ? 'Edit Destination' : 'Add Destination'}
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

              <div className="flex-1 p-6 overflow-y-auto">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-full w-0.5 bg-red-500 rounded-l-sm"></div>
                      <Input 
                        type="text" 
                        className="pl-3.5"
                        placeholder="Enter destination name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    >
                      <option value="">Select state</option>
                      {states.filter(s => s.status === 'Active').map(state => (
                        <option key={state.id} value={state.name}>{state.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <Input 
                      type="text" 
                      placeholder="Enter country"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                      placeholder="Enter destination description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Best Season</label>
                    <Input 
                      type="text" 
                      placeholder="e.g., October to March"
                      value={formData.best_season}
                      onChange={(e) => setFormData({...formData, best_season: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.default_currency}
                      onChange={(e) => setFormData({...formData, default_currency: e.target.value})}
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.timezone}
                      onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                    </select>
                  </div>

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
                </form>
              </div>

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
                    onClick={handleSaveDestination}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (editingDestination ? 'Update' : 'Save')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Destinations



