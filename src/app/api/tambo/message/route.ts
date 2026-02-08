import { NextRequest, NextResponse } from 'next/server'

// Helper function to extract company names from query
function extractCompanyNames(content: string): string[] {
  const companies = [
    'amazon', 'microsoft', 'google', 'apple', 'facebook', 'meta', 'tesla', 'nike', 
    'adidas', 'campus x', 'red chief', 'walmart', 'coca-cola', 'pepsi', 'netflix',
    'disney', 'samsung', 'sony', 'intel', 'amd', 'ibm', 'oracle', 'salesforce'
  ]
  
  const foundCompanies: string[] = []
  const lowerContent = content.toLowerCase()
  
  companies.forEach(company => {
    if (lowerContent.includes(company)) {
      foundCompanies.push(company)
    }
  })
  
  // If no known company found, extract potential company names
  if (foundCompanies.length === 0) {
    // Extract words that might be company names (capitalized words, brand names)
    const words = content.split(/\s+/)
    const potentialCompanies = words.filter(word => 
      word.length > 2 && 
      word === word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    
    if (potentialCompanies.length > 0) {
      foundCompanies.push(...potentialCompanies)
    } else {
      // If still nothing, use the main noun from query
      const mainWords = content.toLowerCase().split(/\s+/)
        .filter(word => word.length > 3 && !['show', 'revenue', 'metrics', 'for', 'the', 'company'].includes(word))
      
      if (mainWords.length > 0) {
        foundCompanies.push(mainWords[0])
      }
    }
  }
  
  return foundCompanies
}

// Generate dynamic data based on company
function generateCompanyData(company: string, content: string) {
  const companyLower = company.toLowerCase()
  const now = Date.now()
  
  // Generate deterministic but varied data based on company name
  const hash = companyLower.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // Base revenue values scaled by hash
  const baseRevenue = 100 + (hash % 900) // 100-1000
  const growthRate = 5 + (hash % 20) // 5-25%
  
  return {
    companyName: company.charAt(0).toUpperCase() + company.slice(1),
    primaryColor: getCompanyColor(companyLower),
    revenue: `$${(baseRevenue / 10).toFixed(1)}B`, // Convert to billions
    growth: `+${growthRate}%`,
    segments: [
      { name: 'Core Business', value: `$${(baseRevenue * 0.6 / 10).toFixed(1)}B`, growth: `+${growthRate}%` },
      { name: 'Digital Services', value: `$${(baseRevenue * 0.3 / 10).toFixed(1)}B`, growth: `+${growthRate + 5}%` },
      { name: 'Other Ventures', value: `$${(baseRevenue * 0.1 / 10).toFixed(1)}B`, growth: `+${growthRate - 2}%` }
    ]
  }
}

function getCompanyColor(company: string): string {
  const colorMap: Record<string, string> = {
    'amazon': 'orange',
    'microsoft': 'blue',
    'google': 'red',
    'apple': 'gray',
    'facebook': 'blue',
    'meta': 'purple',
    'tesla': 'red',
    'nike': 'orange',
    'adidas': 'black',
    'campus x': 'green',
    'red chief': 'red',
    'walmart': 'blue',
    'coca-cola': 'red',
    'pepsi': 'blue',
    'netflix': 'red',
    'disney': 'blue',
    'samsung': 'blue',
    'sony': 'black',
    'intel': 'blue',
    'amd': 'red',
    'ibm': 'blue',
    'oracle': 'red',
    'salesforce': 'blue'
  }
  
  return colorMap[company] || ['blue', 'green', 'red', 'purple', 'orange'][Math.abs(company.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 5]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    console.log('📨 Tambo Message Request:', content)

    // Extract company names from query
    const companies = extractCompanyNames(content)
    const primaryCompany = companies[0] || 'business'
    
    // Generate dynamic company data
    const companyData = generateCompanyData(primaryCompany, content)
    
    let responseText = ''
    let components: any[] = []
    
    // Determine what type of analysis was requested
    const lowerContent = content.toLowerCase()
    const isRevenueQuery = lowerContent.includes('revenue') || lowerContent.includes('metric')
    const isGrowthQuery = lowerContent.includes('growth') || lowerContent.includes('trend')
    const isComparisonQuery = lowerContent.includes('compare') || lowerContent.includes('vs') || lowerContent.includes('versus')
    const isAlertQuery = lowerContent.includes('alert') || lowerContent.includes('warning')
    
    // Generate appropriate components based on query type
    if (isRevenueQuery) {
      responseText = `${companyData.companyName} revenue metrics analysis:\n`
      
      components = [
        {
          "type": "tool",
          "name": "show_component_MetricCard",
          "args": {
            "title": `${companyData.companyName} Annual Revenue`,
            "value": companyData.revenue,
            "trend": "up",
            "change": companyData.growth,
            "subtitle": "Current Year",
            "color": companyData.primaryColor,
            "_company": companyData.companyName,
            "_queryContext": content.substring(0, 50)
          }
        },
        {
          "type": "tool",
          "name": "show_component_MetricCard",
          "args": {
            "title": `${companyData.companyName} Quarterly Growth`,
            "value": companyData.growth,
            "trend": companyData.growth.includes('+') ? "up" : "down",
            "change": companyData.growth,
            "subtitle": "QoQ Change",
            "color": companyData.primaryColor,
            "_company": companyData.companyName,
            "_queryContext": content.substring(0, 50)
          }
        },
        {
          "type": "tool",
          "name": "show_component_GraphCard",
          "args": {
            "title": `${companyData.companyName} Revenue Trend`,
            "type": "line",
            "data": [
              {"label": "Q1", "value": parseFloat(companyData.revenue.replace(/[^0-9.]/g, '')) * 0.85},
              {"label": "Q2", "value": parseFloat(companyData.revenue.replace(/[^0-9.]/g, '')) * 0.92},
              {"label": "Q3", "value": parseFloat(companyData.revenue.replace(/[^0-9.]/g, '')) * 0.96},
              {"label": "Q4", "value": parseFloat(companyData.revenue.replace(/[^0-9.]/g, ''))}
            ],
            "yAxisLabel": "Revenue ($B)",
            "colorScheme": companyData.primaryColor,
            "_company": companyData.companyName,
            "_queryContext": content.substring(0, 50)
          }
        }
      ]
      
      // Add business summary table
      components.push({
        "type": "tool",
        "name": "show_component_BusinessSummaryTable",
        "args": {
          "title": `${companyData.companyName} Business Segments`,
          "columns": ["Segment", "Revenue", "Growth", "Status"],
          "rows": companyData.segments.map(segment => ({
            "item": segment.name,
            "value": segment.value,
            "change": segment.growth,
            "status": segment.growth.includes('+') ? "success" : "warning"
          })),
          "_company": companyData.companyName,
          "_queryContext": content.substring(0, 50)
        }
      })
      
      // Add insight card
      components.push({
        "type": "tool",
        "name": "show_component_InsightCard",
        "args": {
          "title": `${companyData.companyName} Business Insight`,
          "insight": `${companyData.companyName} shows strong revenue growth of ${companyData.growth} with digital services leading at ${companyData.segments[1].growth}. Core business remains stable while new ventures show promising traction.`,
          "severity": "positive",
          "recommendations": [
            "Expand digital services offerings",
            "Optimize core business operations",
            "Invest in high-growth ventures"
          ],
          "_company": companyData.companyName,
          "_queryContext": content.substring(0, 50)
        }
      })
    }
    else if (isGrowthQuery) {
      responseText = `${companyData.companyName} growth analysis:\n`
      
      components = [
        {
          "type": "tool",
          "name": "show_component_MetricCard",
          "args": {
            "title": `${companyData.companyName} YoY Growth`,
            "value": companyData.growth,
            "trend": "up",
            "change": companyData.growth,
            "color": companyData.primaryColor,
            "_company": companyData.companyName,
            "_queryContext": content.substring(0, 50)
          }
        },
        {
          "type": "tool",
          "name": "show_component_GraphCard",
          "args": {
            "title": `${companyData.companyName} Growth Trajectory`,
            "type": "area",
            "data": Array.from({length: 8}, (_, i) => ({
              label: `Q${i+1}`,
              value: 100 + (i * 15) + (Math.random() * 20)
            })),
            "yAxisLabel": "Growth Index",
            "colorScheme": companyData.primaryColor,
            "_company": companyData.companyName,
            "_queryContext": content.substring(0, 50)
          }
        }
      ]
    }
    else if (isComparisonQuery && companies.length >= 2) {
      // Multi-company comparison
      responseText = `${companies.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' vs ')} comparison:\n`
      
      const companiesData = companies.map(c => generateCompanyData(c, content))
      
      components = [
        {
          "type": "tool",
          "name": "show_component_ComparisonCard",
          "args": {
            "title": `${companiesData[0].companyName} vs ${companiesData[1].companyName}`,
            "leftLabel": companiesData[0].companyName,
            "leftValue": companiesData[0].revenue,
            "rightLabel": companiesData[1].companyName,
            "rightValue": companiesData[1].revenue,
            "difference": `$${Math.abs(parseFloat(companiesData[0].revenue) - parseFloat(companiesData[1].revenue)).toFixed(1)}B`,
            "percentageChange": `${((parseFloat(companiesData[0].revenue) / parseFloat(companiesData[1].revenue) - 1) * 100).toFixed(1)}%`,
            "verdict": parseFloat(companiesData[0].revenue) > parseFloat(companiesData[1].revenue) ? "better" : "worse",
            "_company": companies.join(','),
            "_queryContext": content.substring(0, 50)
          }
        }
      ]
    }
    else {
      // Default generic response
      responseText = `${companyData.companyName} business analysis:\n`
      
      components = [
        {
          "type": "tool",
          "name": "show_component_MetricCard",
          "args": {
            "title": `${companyData.companyName} Performance`,
            "value": companyData.revenue,
            "trend": "up",
            "change": companyData.growth,
            "color": companyData.primaryColor,
            "_company": companyData.companyName,
            "_queryContext": content.substring(0, 50)
          }
        },
        {
          "type": "tool",
          "name": "show_component_InsightCard",
          "args": {
            "title": `${companyData.companyName} Business Outlook`,
            "insight": `${companyData.companyName} demonstrates strong market position with consistent growth across segments. Digital transformation initiatives are showing positive results.`,
            "severity": "positive",
            "recommendations": [
              "Continue digital innovation",
              "Expand market reach",
              "Optimize operational efficiency"
            ],
            "_company": companyData.companyName,
            "_queryContext": content.substring(0, 50)
          }
        }
      ]
    }

    // Combine response text with JSON components
    const fullResponse = responseText + '\n' + components.map(c => JSON.stringify(c)).join('\n')

    const responseData = {
      id: `msg_${Date.now()}`,
      threadId: 'demo-thread',
      isCancelled: false,
      createdAt: new Date().toISOString(),
      content: [{
        type: "text",
        text: fullResponse
      }],
      role: "assistant"
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 }
    )
  }
}