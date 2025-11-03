import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { searchLocationTool } from '@/lib/tools/searchLocation'
import { reverseGeocodeTool } from '@/lib/tools/reverseGeocode'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await streamText({
      model: openai('gpt-5-mini') as any,
      messages,
      system: 'You are a helpful assistant that can search for locations and reverse geocode coordinates.',
      tools: {
        searchLocation: searchLocationTool,
        reverseGeocode: reverseGeocodeTool,
      },
      maxTokens: 2000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('API route error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
