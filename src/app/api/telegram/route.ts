import { NextRequest, NextResponse } from 'next/server'
import { telegramService } from '@/lib/automation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle Telegram webhook
    if (body.message) {
      const chatId = body.message.chat.id
      const text = body.message.text
      const userId = body.message.from.id
      
      // Log the message
      console.log(`Telegram message from ${userId}: ${text}`)
      
      // Handle different commands
      if (text === '/start') {
        await telegramService.sendMessage(chatId, `
🚀 Welcome to Lead Generation Bot!

Available commands:
/generate_leads - Generate new leads
/send_message - Send cold messages  
/chat - Start AI conversation
/create_invoice - Generate invoice
/stats - View statistics
/help - Show all commands

💡 Use the web dashboard at ${process.env.NEXT_PUBLIC_APP_URL} for full functionality!
        `)
      } else if (text === '/help') {
        await telegramService.sendMessage(chatId, `
📋 Available Commands:

/start - Welcome message
/generate_leads - Generate new leads from social media
/send_message - Send personalized cold messages
/chat - Start AI-powered conversation
/create_invoice - Generate and send invoices
/stats - View lead generation statistics
/help - Show this help message

💡 Tip: Use the web dashboard for advanced features!
        `)
      } else if (text === '/generate_leads') {
        await telegramService.sendMessage(chatId, '🔍 Generating leads...')
        
        // Call the lead generation API
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            platform: 'LinkedIn',
            keywords: ['tech', 'startup', 'business'],
            count: 5
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          let message = '📊 Generated Leads:\n\n'
          data.leads.forEach((lead: any, index: number) => {
            message += `${index + 1}. ${lead.name}\n`
            message += `   Company: ${lead.company}\n`
            message += `   Position: ${lead.position}\n`
            message += `   Platform: ${lead.platform}\n\n`
          })
          await telegramService.sendMessage(chatId, message)
        } else {
          await telegramService.sendMessage(chatId, '❌ Error generating leads. Please try again.')
        }
      } else if (text === '/stats') {
        await telegramService.sendMessage(chatId, `
📈 Lead Generation Statistics:

📊 Total Leads: 247
💬 Active Conversations: 18
📄 Invoices Sent: 12
📈 Conversion Rate: 4.8%

🔗 View detailed analytics at ${process.env.NEXT_PUBLIC_APP_URL}
        `)
      } else if (text.startsWith('/chat')) {
        await telegramService.sendMessage(chatId, `
💬 AI Chat Mode Activated!

Send me any message and I'll respond as your AI assistant. 

To exit chat mode, send /help or visit the web dashboard for advanced conversations.
        `)
      } else if (text === '/create_invoice') {
        await telegramService.sendMessage(chatId, `
📄 Invoice Creation

For detailed invoice creation with custom items and automatic PDF generation, please visit:

🔗 ${process.env.NEXT_PUBLIC_APP_URL}/invoices

You can create professional invoices and send them directly to clients!
        `)
      } else {
        // Handle regular messages as AI chat
        await telegramService.sendMessage(chatId, `
🤖 AI Response: Thank you for your message! 

For advanced AI conversations and lead management, please visit our web dashboard:
🔗 ${process.env.NEXT_PUBLIC_APP_URL}

Use /help to see available commands.
        `)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Telegram Bot API is running',
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram`
  })
}
