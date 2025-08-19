'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  totalLeads: number
  activeConversations: number
  invoicesSent: number
  conversionRate: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeConversations: 0,
    invoicesSent: 0,
    conversionRate: 0
  })
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalLeads: 247,
      activeConversations: 18,
      invoicesSent: 12,
      conversionRate: 4.8
    })
  }, [])

  const handleGenerateLeads = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: 'LinkedIn',
          keywords: ['tech', 'startup', 'business'],
          count: 10
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`Generated ${data.leads.length} new leads!`)
        // Update stats
        setStats(prev => ({
          ...prev,
          totalLeads: prev.totalLeads + data.leads.length
        }))
      }
    } catch (error) {
      alert('Error generating leads. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your lead generation automation platform
        </p>
      </div>

      {/* Hero Banner */}
      <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg p-8 text-white">
        <img 
          src="https://placehold.co/1200x300?text=Professional+lead+automation+dashboard+banner+with+modern+minimalistic+design" 
          alt="Professional lead automation dashboard banner with modern minimalistic design"
          className="w-full h-48 object-cover rounded-lg mb-6"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <h2 className="text-2xl font-bold mb-4">Automate Your Lead Generation</h2>
        <p className="text-gray-300 mb-6">
          Generate leads from social media, send personalized messages, and manage conversations with AI-powered automation.
        </p>
        <button
          onClick={handleGenerateLeads}
          disabled={isGenerating}
          className="bg-white text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-gray-100 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate New Leads'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeConversations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Invoices Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.invoicesSent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Generation</h3>
          <p className="text-gray-600 mb-4">
            Generate new leads from social media platforms using AI-powered targeting.
          </p>
          <a
            href="/leads"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Manage Leads
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Conversations</h3>
          <p className="text-gray-600 mb-4">
            Engage with leads using AI-powered conversations that feel natural and human.
          </p>
          <a
            href="/chat"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Start Chat
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Management</h3>
          <p className="text-gray-600 mb-4">
            Create and send professional invoices to converted leads automatically.
          </p>
          <a
            href="/invoices"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Create Invoice
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-medium">L</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New lead generated from LinkedIn</p>
                <p className="text-sm text-gray-500">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">M</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Cold message sent to John Smith</p>
                <p className="text-sm text-gray-500">15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-medium">I</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Invoice #INV-001 sent to client</p>
                <p className="text-sm text-gray-500">1 hour ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-medium">C</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">AI conversation started with Sarah Johnson</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
