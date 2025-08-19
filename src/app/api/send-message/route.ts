import { NextRequest, NextResponse } from 'next/server'
import { aiService, emailService, databaseService } from '@/lib/automation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, message, type, lead } = body

    if (!leadId && !lead) {
      return NextResponse.json(
        { error: 'Lead ID or lead information is required.' },
        { status: 400 }
      )
    }

    let response = ''
    let success = false

    if (type === 'cold_message' && lead) {
      // Generate and send cold message
      const coldMessage = await aiService.generateColdMessage(lead, message)
      
      // Send via email
      success = await emailService.sendColdEmail(lead, coldMessage)
      
      if (success) {
        // Save message to database
        await databaseService.saveMessage({
          id: `msg_${Date.now()}`,
          leadId: lead.id,
          content: coldMessage,
          type: 'sent',
          timestamp: new Date(),
          platform: 'email'
        })
      }

      response = coldMessage
    } else if (type === 'conversation' && leadId && message) {
      // Get conversation history
      const conversation = await databaseService.getConversation(leadId)
      
      // Generate AI response
      response = await aiService.generateResponse(conversation, message)
      
      // Save both user message and AI response
      await databaseService.saveMessage({
        id: `msg_${Date.now()}_user`,
        leadId,
        content: message,
        type: 'received',
        timestamp: new Date(),
        platform: 'chat'
      })

      await databaseService.saveMessage({
        id: `msg_${Date.now()}_ai`,
        leadId,
        content: response,
        type: 'sent',
        timestamp: new Date(),
        platform: 'chat'
      })

      success = true
    } else {
      return NextResponse.json(
        { error: 'Invalid message type or missing parameters.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success,
      message: response,
      type
    })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required.' },
        { status: 400 }
      )
    }

    const conversation = await databaseService.getConversation(leadId)
    
    return NextResponse.json({
      success: true,
      conversation,
      total: conversation.length
    })

  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation.' },
      { status: 500 }
    )
  }
}
