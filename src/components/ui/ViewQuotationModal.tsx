import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, Printer, Mail, Camera } from 'lucide-react'
import { fetchApi, handleApiError } from '../../lib/api'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface QuotationData {
  queryId: string
  customerName: string
  destination: string
  adults: number
  children: number
  nights: number
  days: number
  startDate: string
  endDate: string
  queryDate: string
  totalPrice: number
  hotels: Array<{
    city: string
    hotelName: string
    checkIn: string
    checkOut: string
    nights: number
    roomType: string
    mealPlan: string
    rooms: number
  }>
  itinerary: Array<{
    day: number
    date: string
    title: string
    description: string
    activities: string[]
  }>
  inclusions: string[]
  exclusions: string[]
  terms: string[]
  cancellationPolicy: string[]
  usefulTips: string[]
}

interface ViewQuotationModalProps {
  isOpen: boolean
  onClose: () => void
  itineraryId?: number
  queryId?: string
}

const fallbackQuotationData: QuotationData = {
  queryId: 'N/A',
  customerName: 'Customer',
  destination: 'Destination',
  adults: 0,
  children: 0,
  nights: 0,
  days: 0,
  startDate: '',
  endDate: '',
  queryDate: '',
  totalPrice: 0,
  hotels: [],
  itinerary: [],
  inclusions: [],
  exclusions: [],
  terms: [],
  cancellationPolicy: [],
  usefulTips: []
}

const ViewQuotationModal: React.FC<ViewQuotationModalProps> = ({
  isOpen,
  onClose,
  itineraryId,
  queryId
}) => {
  const [quotationData, setQuotationData] = useState<QuotationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [shareType, setShareType] = useState<'private' | 'public'>('private')
  const [clients, setClients] = useState<Array<{ id: string; name: string; email: string; phone: string; selected: boolean }>>([])
  const [ccMail, setCcMail] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [sending, setSending] = useState(false)
  const [leadDetails, setLeadDetails] = useState<{ name: string; email: string; phone: string } | null>(null)

  const quotationRef = useRef<HTMLDivElement>(null)

  const fetchQuotationData = useCallback(async () => {
    if (!itineraryId) return

    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Fetching quotation data for itinerary:', itineraryId, 'queryId:', queryId)

      const data = await fetchApi(`/api/quotation/${itineraryId}?queryId=${queryId}`)

      console.log('✅ Quotation data loaded:', data)
      console.log('👤 Customer name:', data.customerName)
      console.log('🏨 Hotels count:', data.hotels.length)
      console.log('💰 Total price:', data.totalPrice)
      setQuotationData(data)
    } catch (error) {
      console.error('❌ Error fetching quotation data:', error)
      setError(handleApiError(error, 'Failed to load quotation data'))
      setQuotationData(fallbackQuotationData)
    } finally {
      setLoading(false)
    }
  }, [itineraryId, queryId])

  const fetchLeadDetails = useCallback(async () => {
    if (!queryId) return
    try {
      const data = await fetchApi(`/api/leads/${queryId}`)
      setLeadDetails(data.lead || data)
    } catch (error) {
      console.error('Error fetching lead details:', error)
      setError(handleApiError(error, 'Failed to load lead details'))
    }
  }, [queryId])

  useEffect(() => {
    if (isOpen && itineraryId) {
      fetchQuotationData()
      fetchLeadDetails()
    }
  }, [isOpen, itineraryId, fetchQuotationData, fetchLeadDetails])

  const handlePrint = () => {
    window.print()
  }

  const fetchClients = async () => {
    if (!queryId) return
    try {
      const response = await fetchApi(`/api/leads/${queryId}`)
      setClients([{
        id: String(response.lead.id),
        name: response.lead.name || '',
        email: response.lead.email || '',
        phone: response.lead.phone || '',
        selected: true
      }])
    } catch (error) {
      console.error('Error fetching clients:', error)
      setError(handleApiError(error, 'Failed to fetch client details'))
    }
  }

  const handleEmail = async () => {
    await fetchClients()
    setShowEmailModal(true)
  }

  const handleSendEmail = async () => {
    if (!quotationRef.current || !quotationData || !leadDetails) {
      alert('Quotation data or lead details are missing.')
      return
    }

    const selectedClients = clients.filter(c => c.selected)
    if (selectedClients.length === 0 && !ccMail) {
      alert('Please select at least one client or add a CC email')
      return
    }

    try {
      setSending(true)
      setError(null)

      // Capture the current view as an image for the email or PDF
      const canvas = await html2canvas(quotationRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/jpeg', 0.8)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      const pdfBase64 = pdf.output('datauristring').split(',')[1]

      await fetchApi('/api/email/send-quotation', {
        method: 'POST',
        body: JSON.stringify({
          itineraryId,
          queryId,
          shareType,
          recipients: selectedClients.map(c => ({ email: c.email, name: c.name })),
          ccMail: ccMail || undefined,
          message: message || undefined,
          quotationData,
          pdf: pdfBase64,
          customerName: leadDetails.name,
          itineraryName: quotationData.destination // Assuming destination can be used as itinerary name
        })
      })

      alert('Quotation sent successfully!')
      setShowEmailModal(false)
      setCcMail('')
      setMessage('')
    } catch (error: any) {
      alert(error?.message || 'Failed to send quotation')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quotation data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!quotationData) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">View Quotation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6" ref={quotationRef}>
          {/* Branding */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-600">travloger.in</h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              ~You travel, We capture
            </p>
          </div>

          {/* Greeting */}
          <div>
            <p className="text-lg">Dear {quotationData.customerName},</p>
            <p className="mt-2">
              This is Travloger.in and I will be working with you to plan your trip to <strong>{quotationData.destination}</strong>.
              Please find below details for your trip and feel free to call me at +919391203737 or{' '}
              <a href="#" className="text-red-600 underline">click here</a> to view more details about this trip.
            </p>
          </div>

          {/* Query Details */}
          <div className="bg-black text-white p-4 rounded">
            <h3 className="text-lg font-semibold mb-4">Query Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>QueryId:</strong> {quotationData.queryId}</div>
              <div><strong>Adult(s):</strong> {quotationData.adults}</div>
              <div><strong>Nights:</strong> {quotationData.nights} Nights & {quotationData.days} Days</div>
              <div><strong>Child(s):</strong> {quotationData.children}</div>
              <div><strong>Destination Covered:</strong> {quotationData.destination}, Cochin, Munnar</div>
              <div><strong>Start Date:</strong> {quotationData.startDate}</div>
              <div><strong>Query Date:</strong> {quotationData.queryDate}</div>
              <div><strong>End Date:</strong> {quotationData.endDate}</div>
            </div>
          </div>

          {/* Hotel Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hotel Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">City</th>
                    <th className="border border-gray-300 p-2 text-left">Hotel Name</th>
                    <th className="border border-gray-300 p-2 text-left">Check In</th>
                    <th className="border border-gray-300 p-2 text-left">Check Out</th>
                    <th className="border border-gray-300 p-2 text-left">Nights</th>
                    <th className="border border-gray-300 p-2 text-left">Room Type</th>
                    <th className="border border-gray-300 p-2 text-left">Meal Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationData.hotels.map((hotel, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{hotel.city}</td>
                      <td className="border border-gray-300 p-2">
                        {hotel.hotelName}
                        <div className="text-sm text-gray-600">Double Room: {hotel.rooms}</div>
                      </td>
                      <td className="border border-gray-300 p-2">{hotel.checkIn}</td>
                      <td className="border border-gray-300 p-2">{hotel.checkOut}</td>
                      <td className="border border-gray-300 p-2">{hotel.nights}</td>
                      <td className="border border-gray-300 p-2">{hotel.roomType}</td>
                      <td className="border border-gray-300 p-2">{hotel.mealPlan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Itinerary Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Itinerary Details</h3>
            {quotationData.itinerary.map((day, index) => (
              <div key={index} className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-gray-500">{day.date}</span>
                  <h4 className="text-lg font-semibold">Day {day.day}: {day.title}</h4>
                </div>
                <p className="text-gray-700 mb-3">{day.description}</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {day.activities.map((activity, actIndex) => (
                    <li key={actIndex}>{activity}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Inclusions & Exclusions */}
          <div>
            <h3 className="text-xl font-bold mb-4">Inclusions & Exclusions</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">Inclusion</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {quotationData.inclusions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Exclusion</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {quotationData.exclusions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Useful Tips */}
          <div>
            <h3 className="text-lg font-bold mb-4">Useful Tips Before Booking</h3>
            <div className="space-y-3">
              {quotationData.usefulTips.map((tip, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-sm">{tip.split(':')[0]}:</h4>
                  <p className="text-sm text-gray-600">{tip.split(':')[1]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div>
            <h3 className="text-lg font-bold mb-4">Cancellation Policy</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {quotationData.cancellationPolicy.map((policy, index) => (
                <li key={index}>{policy}</li>
              ))}
            </ul>
          </div>

          {/* Terms and Conditions */}
          <div>
            <h3 className="text-lg font-bold mb-4">Terms and Conditions</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {quotationData.terms.map((term, index) => (
                <li key={index} className={term.includes('bold') ? 'font-semibold' : ''}>
                  {term.replace('bold', '')}
                </li>
              ))}
            </ul>
          </div>

          {/* Total Package Price */}
          <div className="text-center py-6 border-t">
            <h3 className="text-2xl font-bold">
              Total Package Price: <strong>{quotationData.totalPrice.toLocaleString('en-IN')} INR</strong>
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6 border-t">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              Print Quotation
            </button>
            <button
              onClick={handleEmail}
              className="flex items-center gap-2 px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              <Mail className="w-4 h-4" />
              Send To Email
            </button>
          </div>
        </div>
      </div>

      {/* Send Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">View Quotation</h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Share Options */}
              <div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setShareType('private')}
                    className={`flex-1 py-3 px-4 rounded ${shareType === 'private' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border border-gray-300'}`}
                  >
                    SHARE PRIVATELY
                  </button>
                  <button
                    onClick={() => setShareType('public')}
                    className={`flex-1 py-3 px-4 rounded ${shareType === 'public' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border border-gray-300'}`}
                  >
                    SHARE PUBLICLY
                  </button>
                </div>
                {shareType === 'private' && (
                  <p className="text-sm text-gray-600">
                    Share your itinerary privately via email to specific recipients. Recipients will be prompted to create a login in order to view this itinerary.
                  </p>
                )}
              </div>

              {/* Clients Section */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Clients</h3>
                <p className="text-sm text-gray-600 mb-4">Select client you would like to email this itinerary to.</p>

                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center gap-4 p-3 border rounded">
                      <input
                        type="checkbox"
                        checked={client.selected}
                        onChange={(e) => {
                          setClients(prev => prev.map(c =>
                            c.id === client.id ? { ...c, selected: e.target.checked } : c
                          ))
                        }}
                        className="w-5 h-5 text-blue-600"
                      />
                      <input
                        type="text"
                        value={client.name}
                        onChange={(e) => {
                          setClients(prev => prev.map(c =>
                            c.id === client.id ? { ...c, name: e.target.value } : c
                          ))
                        }}
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        placeholder="Name"
                      />
                      <input
                        type="email"
                        value={client.email}
                        onChange={(e) => {
                          setClients(prev => prev.map(c =>
                            c.id === client.id ? { ...c, email: e.target.value } : c
                          ))
                        }}
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        placeholder="Email"
                      />
                      <input
                        type="tel"
                        value={client.phone}
                        onChange={(e) => {
                          setClients(prev => prev.map(c =>
                            c.id === client.id ? { ...c, phone: e.target.value } : c
                          ))
                        }}
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        placeholder="Phone"
                      />
                    </div>
                  ))}
                </div>

                {/* CC Mail */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CC Mail</label>
                  <input
                    type="email"
                    value={ccMail}
                    onChange={(e) => setCcMail(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="cc@example.com"
                  />
                </div>
              </div>

              {/* Add a Message */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Add a message</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm h-32 resize-none"
                  placeholder="Enter message here"
                />
              </div>

              {/* Send Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewQuotationModal
