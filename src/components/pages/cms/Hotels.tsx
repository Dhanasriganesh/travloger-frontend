import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Plus, Search, Edit, Trash2, ArrowLeft, Hotel, Star, MapPin, Phone, Mail, Globe, Clock, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Hotel {
  id: number
  name: string
  status: string
  destination: string
  address: string
  city: string
  state: string
  country: string
  star_rating: number
  hotel_type: string
  contact_person: string
  email: string
  phone: string
  website: string
  check_in_time: string
  check_out_time: string
  amenities: string[]
  description: string
  created_by: string
  date: string
}

const Hotels: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  
  // Filters
  const [filters, setFilters] = useState({
    destination: '',
    star_rating: '',
    hotel_type: '',
    status: ''
  })

  const [formData, setFormData] = useState({
    name: '',
    status: 'Active',
    state: '',
    destination: '',
    address: '',
    city: '',
    country: '',
    star_rating: 0,
    hotel_type: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    check_in_time: '14:00',
    check_out_time: '12:00',
    amenities: '',
    description: ''
  })

  const hotelTypes = [
    'Luxury Hotel',
    'Business Hotel',
    'Resort',
    'Boutique Hotel',
    'Budget Hotel',
    'Motel',
    'Hostel',
    'Bed & Breakfast',
    'Apartment Hotel',
    'Villa',
    'Guest House',
    'Heritage Hotel'
  ]

  const commonAmenities = [
    'WiFi', 'Parking', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service',
    'Laundry', 'Concierge', 'Business Center', 'Conference Rooms', 'Airport Shuttle',
    'Pet Friendly', 'Air Conditioning', 'Elevator', 'Balcony', 'Kitchen'
  ]

  useEffect(() => {
    fetchHotels()
    fetchStates()
  }, [filters])

  useEffect(() => {
    if (formData.state) {
      fetchDestinations(formData.state)
    } else {
      setDestinations([])
    }
  }, [formData.state])

  const fetchHotels = async () => {
    try {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })
      
      const response = await fetch(`${API_URL}/api/hotels?${queryParams}`)
      const data = await response.json()
      
      if (response.ok) {
        setHotels(data.hotels || [])
      } else {
        console.error('Failed to fetch hotels:', data.error)
        alert('Failed to fetch hotels: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
      alert('Error fetching hotels. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

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

  const fetchDestinations = async (state?: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const url = state ? `${API_URL}/api/destinations?state=${encodeURIComponent(state)}` : `${API_URL}/api/destinations`
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setDestinations(data.destinations || [])
      }
    } catch (error) {
      console.error('Error fetching destinations:', error)
      setDestinations([])
    }
  }

  const handleSaveHotel = async () => {
    if (!formData.name.trim()) {
      alert('Please enter hotel name')
      return
    }

    try {
      setSaving(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const method = editingHotel ? 'PUT' : 'POST'
      const body = editingHotel 
        ? { id: editingHotel.id, ...formData }
        : formData

      const response = await fetch(`${API_URL}/api/hotels`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        await fetchHotels()
        setShowAddForm(false)
        resetForm()
        alert(data.message || 'Hotel saved successfully')
      } else {
        alert('Error saving hotel: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving hotel:', error)
      alert('Error saving hotel. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteHotel = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/hotels?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        await fetchHotels()
        alert(data.message || 'Hotel deleted successfully')
      } else {
        alert('Error deleting hotel: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting hotel:', error)
      alert('Error deleting hotel. Please try again.')
    }
  }

  const handleEditClick = async (hotel: Hotel) => {
    setEditingHotel(hotel)
    const stateValue = hotel.state || ''
    setFormData({
      name: hotel.name,
      status: hotel.status,
      state: stateValue,
      destination: hotel.destination || '',
      address: hotel.address || '',
      city: hotel.city || '',
      country: hotel.country || '',
      star_rating: hotel.star_rating || 0,
      hotel_type: hotel.hotel_type || '',
      contact_person: hotel.contact_person || '',
      email: hotel.email || '',
      phone: hotel.phone || '',
      website: hotel.website || '',
      check_in_time: hotel.check_in_time || '14:00',
      check_out_time: hotel.check_out_time || '12:00',
      amenities: hotel.amenities || [],
      description: hotel.description || ''
    })
    // Fetch destinations for the selected state
    if (stateValue) {
      await fetchDestinations(stateValue)
    }
    setShowAddForm(true)
  }

  const resetForm = () => {
    setEditingHotel(null)
    setFormData({
      name: '',
      status: 'Active',
      destination: '',
      address: '',
      city: '',
      state: '',
      country: '',
      star_rating: 0,
      hotel_type: '',
      contact_person: '',
      email: '',
      phone: '',
      website: '',
      check_in_time: '14:00',
      check_out_time: '12:00',
      amenities: [],
      description: ''
    })
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    resetForm()
  }

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">({rating})</span>
      </div>
    )
  }

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = Array.isArray(formData.amenities) ? [...formData.amenities] : []
    const amenityIndex = currentAmenities.indexOf(amenity)
    
    if (amenityIndex > -1) {
      currentAmenities.splice(amenityIndex, 1)
    } else {
      currentAmenities.push(amenity)
    }
    
    setFormData({...formData, amenities: currentAmenities})
  }

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.hotel_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading hotels...</p>
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
              <h1 className="text-lg font-bold text-gray-900">Hotel Master</h1>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                <Input
                  type="text"
                  placeholder="Search hotels..."
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
              Add Hotel
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filters.destination}
              onChange={(e) => setFilters({...filters, destination: e.target.value})}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="">All Destinations</option>
              {destinations.map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>

            <select
              value={filters.star_rating}
              onChange={(e) => setFilters({...filters, star_rating: e.target.value})}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Star</option>
              <option value="4">4 Star</option>
              <option value="3">3 Star</option>
              <option value="2">2 Star</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={filters.hotel_type}
              onChange={(e) => setFilters({...filters, hotel_type: e.target.value})}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="">All Types</option>
              {hotelTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              onClick={() => setFilters({destination: '', star_rating: '', hotel_type: '', status: ''})}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
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
                    <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel Name</th>
                    <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Times</th>
                    <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 text-sm text-gray-900">
                        <Hotel className="h-5 w-5 text-indigo-500" />
                      </td>
                      <td className="px-3 py-4 text-sm font-medium text-gray-900">
                        <div className="truncate" title={hotel.name}>
                          {hotel.name}
                        </div>
                        {hotel.city && (
                          <div className="text-xs text-gray-500 truncate">{hotel.city}</div>
                        )}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 truncate">
                        {hotel.destination || '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {renderStarRating(hotel.star_rating)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 truncate">
                        {hotel.hotel_type || '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {hotel.phone && (
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{hotel.phone}</span>
                            </div>
                          )}
                          {hotel.email && (
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{hotel.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>In: {hotel.check_in_time}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>Out: {hotel.check_out_time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        <Badge 
                          variant={hotel.status === 'Active' ? 'success' : 'secondary'}
                          className={hotel.status === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}
                        >
                          {hotel.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">T</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {hotel.date}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <button 
                          onClick={() => handleEditClick(hotel)}
                          className="hover:text-gray-700"
                          title="Edit hotel"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <button 
                          onClick={() => handleDeleteHotel(hotel.id, hotel.name)}
                          className="hover:text-red-600"
                          title="Delete hotel"
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
          Total Records: {filteredHotels.length}
        </div>
      </div>

      {/* Add/Edit Hotel Form Panel */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            onClick={handleCloseForm}
          />
          
          <div className="absolute right-0 top-0 h-full w-[700px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingHotel ? 'Edit Hotel' : 'Add Hotel'}
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
                  {/* Basic Information */}
                  <div className="border-b pb-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hotel Name <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          type="text" 
                          placeholder="Enter hotel name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Type</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.hotel_type}
                          onChange={(e) => setFormData({...formData, hotel_type: e.target.value})}
                        >
                          <option value="">Select type</option>
                          {hotelTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.star_rating}
                          onChange={(e) => setFormData({...formData, star_rating: parseInt(e.target.value)})}
                        >
                          <option value={0}>No Rating</option>
                          <option value={1}>1 Star</option>
                          <option value={2}>2 Star</option>
                          <option value={3}>3 Star</option>
                          <option value={4}>4 Star</option>
                          <option value={5}>5 Star</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.state}
                          onChange={(e) => {
                            setFormData({...formData, state: e.target.value, destination: ''})
                          }}
                        >
                          <option value="">Select state</option>
                          {states.filter(s => s.status === 'Active').map(state => (
                            <option key={state.id} value={state.name}>{state.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.destination}
                          onChange={(e) => setFormData({...formData, destination: e.target.value})}
                          disabled={!formData.state}
                        >
                          <option value="">{formData.state ? 'Select destination' : 'Select state first'}</option>
                          {destinations.map(dest => (
                            <option key={dest.id || dest.name || dest} value={dest.name || dest}>{dest.name || dest}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="border-b pb-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Location Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                        placeholder="Enter hotel address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <Input 
                          type="text" 
                          placeholder="Enter city"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <Input 
                          type="text" 
                          placeholder="Enter state"
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                        />
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
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="border-b pb-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <Input 
                          type="text" 
                          placeholder="Enter contact person name"
                          value={formData.contact_person}
                          onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <Input 
                          type="tel" 
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input 
                          type="email" 
                          placeholder="Enter email address"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <Input 
                          type="url" 
                          placeholder="https://..."
                          value={formData.website}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hotel Policies */}
                  <div className="border-b pb-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Hotel Policies</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                        <Input 
                          type="time" 
                          value={formData.check_in_time}
                          onChange={(e) => setFormData({...formData, check_in_time: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
                        <Input 
                          type="time" 
                          value={formData.check_out_time}
                          onChange={(e) => setFormData({...formData, check_out_time: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="border-b pb-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Amenities</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {commonAmenities.map(amenity => {
                        const isSelected = Array.isArray(formData.amenities) ? formData.amenities.includes(amenity) : false
                        return (
                          <label key={amenity} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleAmenity(amenity)}
                              className="rounded"
                            />
                            {amenity}
                          </label>
                        )
                      })}
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selected Amenities</label>
                      <div className="text-sm text-gray-600 min-h-[2rem] p-2 border border-gray-200 rounded">
                        {Array.isArray(formData.amenities) && formData.amenities.length > 0 
                          ? formData.amenities.join(', ') 
                          : 'No amenities selected'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                      placeholder="Enter hotel description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
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
                    onClick={handleSaveHotel}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (editingHotel ? 'Update' : 'Save')}
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

export default Hotels
