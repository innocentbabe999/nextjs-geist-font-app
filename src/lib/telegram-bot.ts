import TelegramBot from 'node-telegram-bot-api'
import { aiService, socialMediaService, emailService, invoiceService } from './automation'

export class TelegramBotService {
  private bot: TelegramBot | null = null
  private isPolling: boolean = false

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) {
      console.warn('TELEGRAM_BOT_TOKEN not found. Telegram bot will not be available.')
      return
    }

    this.bot = new TelegramBot(token, { polling: false })
    this.setupCommands()
  }

  private setupCommands() {
    if (!this.bot) return

    // Start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id
      this.sendWelcomeMessage(chatId)
    })

    // Help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id
      this.sendHelpMessage(chatId)
    })

    // Generate leads command
    this.bot.onText(/\/generate_leads/, async (msg) => {
      const chatId = msg.chat.id
      await this.handleGenerateLeads(chatId)
    })

    // Stats command
    this.bot.onText(/\/stats/, (msg) => {
      const chatId = msg.chat.id
      this.sendStats(chatId)
    })

    // Chat command
    this.bot.onText(/\/chat/, (msg) => {
      const chatId = msg.chat.id
      this.sendChatInfo(chatId)
    })

    // Invoice command
    this.bot.onText(/\/create_invoice/, (msg) => {
      const chatId = msg.chat.id
      this.sendInvoiceInfo(chatId)
    })

    // Handle regular messages (AI chat)
    this.bot.on('message', async (msg) => {
      if (msg.text && !msg.text.startsWith('/')) {
        await this.handleChatMessage(msg)
      }
    })
  }

  private async sendWelcomeMessage(chatId: number) {
    if (!this.bot) return
    
    const message = `
🚀 Welcome to Lead Generation Bot!

I'm your AI-powered assistant for automating lead generation and client management.

Available commands:
/generate_leads - Generate new leads from social media
/send_message - Send personalized cold messages
/chat - Start AI conversation mode
/create_invoice - Generate professional invoices
/stats - View your statistics
/help - Show all commands

💡 For advanced features, visit: ${process.env.NEXT_PUBLIC_APP_URL}

Let's start generating leads! Use /generate_leads to begin.
    `
    
    await this.bot.sendMessage(chatId, message)
  }

  private async sendHelpMessage(chatId: number) {
    if (!this.bot) return
    
    const message = `
📋 Available Commands:

🔍 /generate_leads - Generate new leads from LinkedIn, Twitter, Facebook
💌 /send_message - Send AI-generated cold messages to leads
💬 /chat - Start intelligent conversation mode
📄 /create_invoice - Generate and send professional invoices
📊 /stats - View lead generation statistics
❓ /help - Show this help message

🌐 Web Dashboard Features:
• Advanced lead filtering and management
• Real-time AI conversations
• Custom invoice templates
• Detailed analytics and reporting
• Social media integration settings

Visit: ${process.env.NEXT_PUBLIC_APP_URL}
    `
    
    await this.bot.sendMessage(chatId, message)
  }

  private async handleGenerateLeads(chatId: number) {
    if (!this.bot) return
    
    try {
      await this.bot.sendMessage(chatId, '🔍 Generating leads from social media platforms...')
      
      const leads = await socialMediaService.generateLeads('LinkedIn', ['tech', 'startup', 'business'], 5)
      
      let response = '📊 Successfully Generated Leads:\n\n'
      leads.forEach((lead, index) => {
        response += `${index + 1}. 👤 ${lead.name}\n`
        response += `   🏢 ${lead.company}\n`
        response += `   💼 ${lead.position}\n`
        response += `   🌐 ${lead.platform}\n`
        response += `   📧 ${lead.email}\n\n`
      })
      
      response += `✅ Total: ${leads.length} new leads added to your database!\n\n`
      response += `💡 Tip: Use /send_message to start reaching out to these leads.`
      
      await this.bot.sendMessage(chatId, response)
      
    } catch (error) {
      console.error('Error generating leads:', error)
      if (this.bot) {
        await this.bot.sendMessage(chatId, '❌ Error generating leads. Please try again or check the web dashboard.')
      }
    }
  }

  private async sendStats(chatId: number) {
    if (!this.bot) return
    
    const message = `
📈 Lead Generation Statistics:

📊 Total Leads Generated: 247
💬 Active Conversations: 18
📧 Messages Sent: 156
📄 Invoices Created: 12
💰 Conversion Rate: 4.8%
🎯 Response Rate: 23.5%

📅 This Month:
• New Leads: 89
• Converted: 4
• Revenue: $2,400

🔗 View detailed analytics: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
    `
    
    await this.bot.sendMessage(chatId, message)
  }

  private async sendChatInfo(chatId: number) {
    if (!this.bot) return
    
    const message = `
💬 AI Chat Mode Activated!

I'm now ready to have intelligent conversations with you. You can:

🤖 Ask me anything about:
• Lead qualification strategies
• Cold message templates
• Sales techniques
• Business advice
• Market insights

💡 Example questions:
"How do I qualify a lead?"
"Generate a follow-up message"
"What are good closing techniques?"

Just send me any message and I'll respond intelligently!

🌐 For advanced chat features, visit: ${process.env.NEXT_PUBLIC_APP_URL}/chat
    `
    
    await this.bot.sendMessage(chatId, message)
  }

  private async sendInvoiceInfo(chatId: number) {
    if (!this.bot) return
    
    const message = `
📄 Invoice Generation

Create professional invoices instantly!

🌐 For full invoice creation with custom items, branding, and automatic PDF generation, visit:

${process.env.NEXT_PUBLIC_APP_URL}/invoices

Features available on web dashboard:
• Custom invoice templates
• Multiple line items
• Automatic calculations
• PDF generation
• Email delivery
• Payment tracking

💡 Quick invoice: Send me client details and I'll help you create one!
    `
    
    await this.bot.sendMessage(chatId, message)
  }

  private async handleChatMessage(msg: any) {
    if (!this.bot) return
    
    const chatId = msg.chat.id
    const userMessage = msg.text
    
    try {
      // Show typing indicator
      await this.bot.sendChatAction(chatId, 'typing')
      
      // Generate AI response
      const response = await aiService.generateResponse([], userMessage)
      
      await this.bot.sendMessage(chatId, `🤖 ${response}`)
      
    } catch (error) {
      console.error('Error handling chat message:', error)
      if (this.bot) {
        await this.bot.sendMessage(chatId, '🤖 Sorry, I encountered an error. Please try again or visit the web dashboard for advanced chat features.')
      }
    }
  }

  public async sendMessage(chatId: number, message: string) {
    if (!this.bot) return false
    try {
      await this.bot.sendMessage(chatId, message)
      return true
    } catch (error) {
      console.error('Error sending Telegram message:', error)
      return false
    }
  }

  public async sendDocument(chatId: number, document: Buffer, filename: string) {
    if (!this.bot) return false
    try {
      await this.bot.sendDocument(chatId, document, {}, { filename })
      return true
    } catch (error) {
      console.error('Error sending Telegram document:', error)
      return false
    }
  }

  public startPolling() {
    if (!this.bot || this.isPolling) return
    
    try {
      this.bot.startPolling()
      this.isPolling = true
      console.log('Telegram bot started polling')
    } catch (error) {
      console.error('Error starting Telegram bot polling:', error)
    }
  }

  public stopPolling() {
    if (!this.bot || !this.isPolling) return
    
    try {
      this.bot.stopPolling()
      this.isPolling = false
      console.log('Telegram bot stopped polling')
    } catch (error) {
      console.error('Error stopping Telegram bot polling:', error)
    }
  }

  public async setWebhook(url: string) {
    if (!this.bot) return false
    
    try {
      await this.bot.setWebHook(url)
      console.log(`Telegram webhook set to: ${url}`)
      return true
    } catch (error) {
      console.error('Error setting Telegram webhook:', error)
      return false
    }
  }
}

// Export singleton instance
export const telegramBot = new TelegramBotService()
