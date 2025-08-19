import axios from 'axios';
import nodemailer from 'nodemailer';
import jsPDF from 'jspdf';
import TelegramBot from 'node-telegram-bot-api';

// Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  platform: string;
  profileUrl: string;
  company?: string;
  position?: string;
  status: 'new' | 'contacted' | 'responded' | 'converted';
  createdAt: Date;
  lastContact?: Date;
}

export interface Message {
  id: string;
  leadId: string;
  content: string;
  type: 'sent' | 'received';
  timestamp: Date;
  platform: string;
}

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  total: number;
  date: Date;
  status: 'draft' | 'sent' | 'paid';
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

// AI/LLM Integration
export class AIService {
  private apiKey: string;
  private model: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.model = process.env.AI_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
  }

  async generateColdMessage(lead: Lead, context?: string): Promise<string> {
    try {
      const systemPrompt = `You are a professional sales assistant. Generate personalized cold messages for lead generation. 
      Be professional, concise, and value-focused. Avoid being pushy or salesy. 
      Focus on how you can help solve their potential problems or add value to their business.`;

      const userPrompt = `Generate a personalized cold message for:
      Name: ${lead.name}
      Company: ${lead.company || 'Unknown'}
      Position: ${lead.position || 'Unknown'}
      Platform: ${lead.platform}
      ${context ? `Additional context: ${context}` : ''}
      
      Keep it under 150 words and make it conversational.`;

      const response = await axios.post(this.baseUrl, {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating cold message:', error);
      throw new Error('Failed to generate cold message');
    }
  }

  async generateResponse(conversation: Message[], newMessage: string): Promise<string> {
    try {
      const systemPrompt = `You are a professional sales representative having a conversation with a potential client. 
      Be helpful, knowledgeable, and focus on understanding their needs. 
      Provide value in every interaction and guide the conversation towards a potential business relationship.
      Keep responses concise and professional.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversation.map(msg => ({
          role: msg.type === 'sent' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: newMessage }
      ];

      const response = await axios.post(this.baseUrl, {
        model: this.model,
        messages,
        max_tokens: 400,
        temperature: 0.8
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}

// Social Media Lead Generation
export class SocialMediaService {
  async generateLeads(platform: string, keywords: string[], count: number = 10): Promise<Lead[]> {
    try {
      // For demo purposes, we'll generate mock leads
      // In production, this would integrate with actual social media APIs
      const mockLeads: Lead[] = [];
      
      const platforms = ['LinkedIn', 'Twitter', 'Facebook', 'Instagram'];
      const companies = ['TechCorp', 'InnovateLab', 'StartupHub', 'DigitalFlow', 'CloudTech'];
      const positions = ['CEO', 'CTO', 'Marketing Director', 'Sales Manager', 'Founder'];
      const names = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez'];

      for (let i = 0; i < count; i++) {
        const lead: Lead = {
          id: `lead_${Date.now()}_${i}`,
          name: names[Math.floor(Math.random() * names.length)],
          email: `contact${i}@${companies[Math.floor(Math.random() * companies.length)].toLowerCase()}.com`,
          platform: platform || platforms[Math.floor(Math.random() * platforms.length)],
          profileUrl: `https://${platform.toLowerCase()}.com/profile/${i}`,
          company: companies[Math.floor(Math.random() * companies.length)],
          position: positions[Math.floor(Math.random() * positions.length)],
          status: 'new',
          createdAt: new Date()
        };
        mockLeads.push(lead);
      }

      return mockLeads;
    } catch (error) {
      console.error('Error generating leads:', error);
      throw new Error('Failed to generate leads');
    }
  }

  async scrapePublicData(platform: string, searchQuery: string): Promise<any[]> {
    // This would implement web scraping logic for public data
    // For now, return mock data
    return [];
  }
}

// Email Service
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendColdEmail(lead: Lead, message: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: lead.email,
        subject: `Partnership Opportunity - ${lead.company}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${lead.name},</h2>
            <div style="line-height: 1.6; color: #333;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <br>
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              Lead Generation Team
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendInvoice(invoice: Invoice, pdfBuffer: Buffer): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: invoice.clientEmail,
        subject: `Invoice #${invoice.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Invoice for ${invoice.clientName}</h2>
            <p>Please find your invoice attached.</p>
            <p><strong>Total Amount: $${invoice.total.toFixed(2)}</strong></p>
            <p>Thank you for your business!</p>
          </div>
        `,
        attachments: [
          {
            filename: `invoice_${invoice.id}.pdf`,
            content: pdfBuffer
          }
        ]
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending invoice:', error);
      return false;
    }
  }
}

// Invoice Generation
export class InvoiceService {
  generateInvoicePDF(invoice: Invoice): Buffer {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('INVOICE', 20, 30);
      
      // Invoice details
      doc.setFontSize(12);
      doc.text(`Invoice #: ${invoice.id}`, 20, 50);
      doc.text(`Date: ${invoice.date.toLocaleDateString()}`, 20, 60);
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 70);
      
      // Client details
      doc.text('Bill To:', 20, 90);
      doc.text(invoice.clientName, 20, 100);
      doc.text(invoice.clientEmail, 20, 110);
      
      // Items table
      let yPosition = 140;
      doc.text('Description', 20, yPosition);
      doc.text('Qty', 120, yPosition);
      doc.text('Price', 150, yPosition);
      doc.text('Total', 180, yPosition);
      
      yPosition += 10;
      doc.line(20, yPosition, 200, yPosition);
      yPosition += 10;
      
      invoice.items.forEach(item => {
        doc.text(item.description, 20, yPosition);
        doc.text(item.quantity.toString(), 120, yPosition);
        doc.text(`$${item.price.toFixed(2)}`, 150, yPosition);
        doc.text(`$${item.total.toFixed(2)}`, 180, yPosition);
        yPosition += 10;
      });
      
      // Total
      yPosition += 10;
      doc.line(150, yPosition, 200, yPosition);
      yPosition += 10;
      doc.setFontSize(14);
      doc.text(`Total: $${invoice.total.toFixed(2)}`, 150, yPosition);
      
      return Buffer.from(doc.output('arraybuffer'));
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }
}

// Telegram Bot Service
export class TelegramService {
  private bot: TelegramBot;
  private aiService: AIService;
  private socialMediaService: SocialMediaService;
  private emailService: EmailService;
  private invoiceService: InvoiceService;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN || '';
    this.bot = new TelegramBot(token, { polling: false });
    this.aiService = new AIService();
    this.socialMediaService = new SocialMediaService();
    this.emailService = new EmailService();
    this.invoiceService = new InvoiceService();
    
    this.setupCommands();
  }

  private setupCommands() {
    // Start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, `
🚀 Welcome to Lead Generation Bot!

Available commands:
/generate_leads - Generate new leads
/send_message - Send cold messages
/chat - Start AI conversation
/create_invoice - Generate invoice
/help - Show all commands
      `);
    });

    // Generate leads
    this.bot.onText(/\/generate_leads/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        this.bot.sendMessage(chatId, '🔍 Generating leads...');
        const leads = await this.socialMediaService.generateLeads('LinkedIn', ['tech', 'startup'], 5);
        
        let response = '📊 Generated Leads:\n\n';
        leads.forEach((lead, index) => {
          response += `${index + 1}. ${lead.name}\n`;
          response += `   Company: ${lead.company}\n`;
          response += `   Position: ${lead.position}\n`;
          response += `   Platform: ${lead.platform}\n\n`;
        });
        
        this.bot.sendMessage(chatId, response);
      } catch (error) {
        this.bot.sendMessage(chatId, '❌ Error generating leads. Please try again.');
      }
    });

    // Help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, `
📋 Available Commands:

/start - Welcome message
/generate_leads - Generate new leads from social media
/send_message - Send personalized cold messages
/chat - Start AI-powered conversation
/create_invoice - Generate and send invoices
/stats - View lead generation statistics
/help - Show this help message

💡 Tip: Use the web dashboard at ${process.env.NEXT_PUBLIC_APP_URL} for full functionality!
      `);
    });
  }

  async sendMessage(chatId: number, message: string) {
    return this.bot.sendMessage(chatId, message);
  }

  async sendDocument(chatId: number, document: Buffer, filename: string) {
    return this.bot.sendDocument(chatId, document, {}, { filename });
  }
}

// Database Service (Simple SQLite implementation)
export class DatabaseService {
  private dbPath: string;

  constructor() {
    this.dbPath = process.env.DATABASE_URL || './leads.db';
  }

  async saveLeads(leads: Lead[]): Promise<void> {
    // In a real implementation, this would save to SQLite
    console.log(`Saving ${leads.length} leads to database`);
  }

  async getLeads(): Promise<Lead[]> {
    // In a real implementation, this would fetch from SQLite
    return [];
  }

  async saveMessage(message: Message): Promise<void> {
    console.log('Saving message to database');
  }

  async getConversation(leadId: string): Promise<Message[]> {
    return [];
  }
}

// Export service instances
export const aiService = new AIService();
export const socialMediaService = new SocialMediaService();
export const emailService = new EmailService();
export const invoiceService = new InvoiceService();
export const telegramService = new TelegramService();
export const databaseService = new DatabaseService();
