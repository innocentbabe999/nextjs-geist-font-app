'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

interface Message {
  id: string
  content: string
  type: 'sent' | 'received'
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [leadId, setLeadId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const leadIdParam = searchParams.get('leadId')
    if (leadIdParam) {
      setLeadId(leadIdParam)
      fetchConversation(leadIdParam)
    } else {
      // Initialize with welcome message
      setMessages([
        {
          id: 'welcome',
          content: 'Hello! I\'m your AI assistant. How can I help you today?',
          type: 'received',
          timestamp: new Date()
        }
      ])
    }
  }, [searchParams])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async (leadId: string) => {
    try {
      const response = await fetch(`/api/send-message?leadId=${leadId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.conversation || [])
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: newMessage,
      type: 'sent',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'conversation',
          leadId: leadId || 'general',
          message: newMessage
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage: Message = {
          id: `msg_${Date.now()}_ai`,
          content: data.message,
          type: 'received',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error('Failed to get AI response')
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: 'Sorry, I encountered an error. Please try again.',
        type: 'received',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Chat Assistant</h1>
        <p className="mt-2 text-gray-600">
          {leadId ? 'Conversation with lead' : 'General AI conversation'}
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-96 lg:h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'sent'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.type === 'sent' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                rows={2}
                disabled={loading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !newMessage.trim()}
              className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Chat Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Capabilities</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Lead qualification questions</li>
            <li>• Product recommendations</li>
            <li>• Pricing discussions</li>
            <li>• Meeting scheduling</li>
            <li>• Follow-up suggestions</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conversation Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Be specific with your questions</li>
            <li>• Provide context when needed</li>
            <li>• Ask for lead qualification help</li>
            <li>• Request message templates</li>
            <li>• Get closing strategies</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setNewMessage('Help me qualify this lead')}
              className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md"
            >
              Lead Qualification
            </button>
            <button
              onClick={() => setNewMessage('Generate a follow-up message')}
              className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md"
            >
              Follow-up Message
            </button>
            <button
              onClick={() => setNewMessage('What are good closing questions?')}
              className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md"
            >
              Closing Strategies
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
