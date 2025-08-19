'use client'

import { useState, useEffect } from 'react'

interface Lead {
  id: string
  name: string
  email: string
  platform: string
  profileUrl: string
  company?: string
  position?: string
  status: 'new' | 'contacted' | 'responded' | 'converted'
  createdAt: Date
  lastContact?: Date
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/generate-leads')
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewLeads = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: 'LinkedIn',
          keywords: ['tech', 'startup', 'business', 'marketing'],
          count: 10
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setLeads(prev => [...data.leads, ...prev])
        alert(`Generated ${data.leads.length} new leads!`)
      }
    } catch (error) {
      alert('Error generating leads. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const sendColdMessage = async (lead: Lead) => {
    setSendingMessage(true)
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'cold_message',
          lead,
          message: 'Generate a personalized cold message for this lead'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        alert('Cold message sent successfully!')
        
        // Update lead status
        setLeads(prev => prev.map(l => 
          l.id === lead.id 
            ? { ...l, status: 'contacted' as const, lastContact: new Date() }
            : l
        ))
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      alert('Error sending message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'responded': return 'bg-green-100 text-green-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="mt-2 text-gray-600">
            Manage and track your generated leads from social media platforms
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={generateNewLeads}
            disabled={generating}
            className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate New Leads'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600">New Leads</p>
          <p className="text-2xl font-bold text-blue-600">
            {leads.filter(l => l.status === 'new').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Contacted</p>
          <p className="text-2xl font-bold text-yellow-600">
            {leads.filter(l => l.status === 'contacted').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Converted</p>
          <p className="text-2xl font-bold text-green-600">
            {leads.filter(l => l.status === 'converted').length}
          </p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Leads</h3>
        </div>
        
        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No leads found</p>
            <button
              onClick={generateNewLeads}
              disabled={generating}
              className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Your First Leads'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.position}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.platform}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {lead.status === 'new' && (
                        <button
                          onClick={() => sendColdMessage(lead)}
                          disabled={sendingMessage}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Send Message
                        </button>
                      )}
                      <a
                        href={`/chat?leadId=${lead.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Chat
                      </a>
                      <a
                        href={lead.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Profile
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
