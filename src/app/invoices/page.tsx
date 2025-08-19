'use client'

import { useState, useEffect } from 'react'

interface InvoiceItem {
  description: string
  quantity: number
  price: number
  total: number
}

interface InvoiceForm {
  clientName: string
  clientEmail: string
  items: InvoiceItem[]
}

export default function InvoicesPage() {
  const [form, setForm] = useState<InvoiceForm>({
    clientName: '',
    clientEmail: '',
    items: [
      {
        description: 'Lead Generation Service',
        quantity: 1,
        price: 500,
        total: 500
      }
    ]
  })
  const [generating, setGenerating] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          price: 0,
          total: 0
        }
      ]
    }))
  }

  const removeItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setForm(prev => {
      const newItems = [...prev.items]
      newItems[index] = {
        ...newItems[index],
        [field]: value
      }
      
      // Recalculate total for this item
      if (field === 'quantity' || field === 'price') {
        newItems[index].total = newItems[index].quantity * newItems[index].price
      }
      
      return {
        ...prev,
        items: newItems
      }
    })
  }

  const getTotalAmount = () => {
    return form.items.reduce((sum, item) => sum + item.total, 0)
  }

  const generateInvoice = async () => {
    if (!form.clientName || !form.clientEmail) {
      alert('Please fill in client name and email')
      return
    }

    if (form.items.length === 0 || form.items.some(item => !item.description)) {
      alert('Please add at least one item with description')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          items: form.items,
          sendEmail
        })
      })

      if (response.ok) {
        // Get the PDF blob
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        // Create download link
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice_${Date.now()}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        // Check if email was sent
        const emailSent = response.headers.get('X-Email-Sent') === 'true'
        const invoiceId = response.headers.get('X-Invoice-Id')

        if (emailSent) {
          alert(`Invoice ${invoiceId} generated and sent to ${form.clientEmail}!`)
        } else {
          alert(`Invoice ${invoiceId} generated and downloaded!`)
        }

        // Reset form
        setForm({
          clientName: '',
          clientEmail: '',
          items: [
            {
              description: 'Lead Generation Service',
              quantity: 1,
              price: 500,
              total: 500
            }
          ]
        })
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      alert('Error generating invoice. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
        <p className="mt-2 text-gray-600">
          Create professional invoices and send them to your clients automatically
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Invoice Details</h2>
          
          {/* Client Information */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => setForm(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter client name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Email *
              </label>
              <input
                type="email"
                value={form.clientEmail}
                onChange={(e) => setForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter client email"
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
              <button
                onClick={addItem}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200"
              >
                Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {form.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Service description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-medium text-gray-700">
                      Total: ${item.total.toFixed(2)}
                    </span>
                    {form.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-2 text-sm text-gray-700">
                Send invoice via email to client
              </span>
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateInvoice}
            disabled={generating}
            className="w-full bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {generating ? 'Generating Invoice...' : 'Generate Invoice'}
          </button>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Invoice Preview</h2>
          
          <div className="border border-gray-200 rounded-md p-6 bg-gray-50">
            {/* Invoice Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">INVOICE</h3>
              <p className="text-gray-600">Invoice #: INV-{Date.now().toString().slice(-6)}</p>
              <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Bill To */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
              <p className="text-gray-700">{form.clientName || 'Client Name'}</p>
              <p className="text-gray-700">{form.clientEmail || 'client@email.com'}</p>
            </div>

            {/* Items */}
            <div className="mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 text-sm font-medium text-gray-700">Description</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-700">Qty</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-700">Price</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2 text-sm text-gray-700">
                        {item.description || 'Service description'}
                      </td>
                      <td className="text-right py-2 text-sm text-gray-700">{item.quantity}</td>
                      <td className="text-right py-2 text-sm text-gray-700">${item.price.toFixed(2)}</td>
                      <td className="text-right py-2 text-sm text-gray-700">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">${getTotalAmount().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Invoice Features */}
          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Professional PDF generation
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Automatic email delivery
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Downloadable format
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Client tracking
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
