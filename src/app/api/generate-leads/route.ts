import { NextRequest, NextResponse } from 'next/server'
import { socialMediaService, databaseService } from '@/lib/automation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, keywords, count } = body

    if (!platform || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Invalid input. Platform and keywords array are required.' },
        { status: 400 }
      )
    }

    const leads = await socialMediaService.generateLeads(
      platform,
      keywords,
      count || 10
    )

    await databaseService.saveLeads(leads)

    return NextResponse.json({
      success: true,
      leads,
      message: `Generated ${leads.length} leads from ${platform}`
    })

  } catch (error) {
    console.error('Error generating leads:', error)
    return NextResponse.json(
      { error: 'Failed to generate leads. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const leads = await databaseService.getLeads()
    
    return NextResponse.json({
      success: true,
      leads,
      total: leads.length
    })

  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads.' },
      { status: 500 }
    )
  }
}
