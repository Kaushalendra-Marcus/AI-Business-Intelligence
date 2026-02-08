import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    console.log('📨 Tambo Message Request:', content)

    // If Tambo isn't generating JSON, we simulate it
    let responseText = ''
    
    if (content.toLowerCase().includes('revenue') || content.includes('metric')) {
      responseText = `Here's your revenue metrics:\n
{"type":"tool","name":"show_component_MetricCard","args":{"title":"Monthly Revenue","value":"$245,000","trend":"up","change":"+12%","subtitle":"Q1 2026"}}\n
{"type":"tool","name":"show_component_MetricCard","args":{"title":"Annual Revenue","value":"$2.9M","trend":"up","change":"+18%","subtitle":"Year to date"}}`
    } else if (content.toLowerCase().includes('compare') || content.includes('vs')) {
      responseText = `Quarter-over-quarter comparison:\n
{"type":"tool","name":"show_component_ComparisonCard","args":{"title":"Q1 vs Q4 Performance","leftLabel":"Q1 2026","leftValue":"$1.2M","rightLabel":"Q4 2025","rightValue":"$1.0M","difference":"+$200K","percentageChange":"+20%","verdict":"better"}}\n
{"type":"tool","name":"show_component_GraphCard","args":{"title":"Revenue Trend","chartType":"line","data":[{"label":"Q3","value":0.9},{"label":"Q4","value":1.0},{"label":"Q1","value":1.2}],"yAxisLabel":"Revenue ($M)"}}`
    } else if (content.toLowerCase().includes('alert')) {
      responseText = `Business alerts requiring attention:\n
{"type":"tool","name":"show_component_AlertList","args":{"title":"Priority Alerts","alerts":[{"title":"Margin Compression","description":"Gross margin decreased from 48% to 45%","level":"warning","recommendedAction":"Review pricing strategy"},{"title":"CAC Increase","description":"Customer acquisition cost rose by 15%","level":"warning","recommendedAction":"Optimize marketing channels"}]}}`
    } else {
      responseText = `Analysis of "${content}":\n
{"type":"tool","name":"show_component_MetricCard","args":{"title":"Sample Metric","value":"$100K","trend":"neutral","change":"+5%","subtitle":"Generated for demo"}}\n
{"type":"tool","name":"show_component_InsightCard","args":{"title":"Key Insight","insight":"Business performance shows steady growth with opportunities for optimization","severity":"positive","recommendations":["Focus on high-margin products","Expand successful channels"]}}`
    }

    const responseData = {
      id: `msg_${Date.now()}`,
      threadId: 'demo-thread',
      isCancelled: false,
      createdAt: new Date().toISOString(),
      content: [{
        type: "text",
        text: responseText
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