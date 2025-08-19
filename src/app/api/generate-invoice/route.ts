import { NextRequest, NextResponse } from 'next/server'
import { invoiceService, emailService } from '@/lib/automation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientName, clientEmail, items, sendEmail } = body

    // Validate input
    if (!clientName || !clientEmail || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Client name, email, and items array are required.' },
        { status: 400 }
      )
    }

    // Calculate totals
    const processedItems = items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity || 1,
      price: parseFloat(item.price) || 0,
      total: (item.quantity || 1) * (parseFloat(item.price) || 0)
    }))

    const total = processedItems.reduce((sum: number, item: any) => sum + item.total, 0)

    // Create invoice object
    const invoice = {
      id: `INV-${Date.now()}`,
      clientName,
      clientEmail,
      items: processedItems,
      total,
      date: new Date(),
      status: 'draft' as 'draft' | 'sent' | 'paid'
    }

    // Generate PDF
    const pdfBuffer = invoiceService.generateInvoicePDF(invoice)

    // Send email if requested
    let emailSent = false
    if (sendEmail) {
      emailSent = await emailService.sendInvoice(invoice, pdfBuffer)
      if (emailSent) {
        invoice.status = 'sent'
      }
    }

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice_${invoice.id}.pdf"`,
        'X-Invoice-Id': invoice.id,
        'X-Email-Sent': emailSent.toString()
      }
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return invoice template or list of invoices
    const template = {
      clientName: '',
      clientEmail: '',
      items: [
        {
          description: 'Lead Generation Service',
          quantity: 1,
          price: 500,
          total: 500
        }
      ],
      total: 500,
      date: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      template
    })

  } catch (error) {
    console.error('Error fetching invoice template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice template.' },
      { status: 500 }
    )
  }
}
