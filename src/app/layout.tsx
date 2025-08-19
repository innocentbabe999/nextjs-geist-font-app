import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lead Generation Automation Platform',
  description: 'Professional lead generation and automation platform with AI-powered conversations and social media integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          <nav className="border-b border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-900">LeadGen Pro</h1>
                  </div>
                  <div className="hidden md:ml-6 md:flex md:space-x-8">
                    <a href="/dashboard" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                      Dashboard
                    </a>
                    <a href="/leads" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                      Leads
                    </a>
                    <a href="/chat" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                      Chat
                    </a>
                    <a href="/invoices" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                      Invoices
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
