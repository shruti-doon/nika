import { tool } from 'ai'
import { z } from 'zod'
import { fetchNominatim, transformToGeoJSON, formatLocationList } from '../utils'

export const searchLocationTool = tool({
  /**
   * This is the high-level prompt for the tool.
   * It tells the LLM *when* to use this tool.
   */
  description: [
    'Search for a specific location, address, or type of place (e.g., "cafe", "museum", "park").',
    'Use this tool when a user asks to find a place, get its coordinates, or see it on a map.',
  ].join('\n'),

  /**
   * This is the detailed prompt for the tool's *parameters*.
   * It tells the LLM *how* to use the tool correctly.
   */
  parameters: z.object({
    query: z.string().describe(
      [
        'The search query string for the Nominatim (OpenStreetMap) API.',
        '---',
        'INSTRUCTIONS FOR THE LLM:',
        'The quality of this query is critical. You MUST follow these rules:',
        
        '1. BE SPECIFIC: Do NOT use generic terms like "food", "fun spots", or "hangout".',
        '   You MUST use specific, Nominatim-friendly types like "restaurant", "cafe", "park", "museum", "cinema", "pub", or "bookshop".',
        
        '2. PROVIDE CONTEXT: You MUST *always* include a city, region, or country.',
        '   - GOOD: "Eiffel Tower, Paris"',
        '   - GOOD: "bookshops in Delhi"',
        '   - BAD: "Eiffel Tower"',
        '   - BAD: "bookshops"',

        '3. HOW TO HANDLE FAILURES (YOUR RESPONSIBILITY):',
        '   If this tool returns "No locations found", DO NOT give up and tell the user you failed.',
        '   It is YOUR job to try again. Call this tool *again* with a different, rephrased query using a synonym.',
        '   - Example 1: If "bookstore in Delhi" fails, you MUST try "bookshop in Delhi".',
        '   - Example 2: If "bar in London" fails, you MUST try "pub in London".',
        '   - Example 3: If "tourist places in Agra" fails, you MUST try "attractions in Agra", and if that also fails, try "monuments in Agra".',
        
        'This tool only executes the query you provide. YOU are responsible for the query strategy.'
      ].join('\n')
    ),
  }),

  execute: async ({ query }) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&polygon_geojson=1`;
      const data: any[] = await fetchNominatim(url);

      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          locations: [],
          geojson: null,
          message: `No locations found for query: "${query}".`,
        };
      }
      const geojson = transformToGeoJSON(data);
      const locationList = formatLocationList(data);

      return {
        locations: data,
        geojson: JSON.stringify(geojson),
        query: query,
        message: `Found ${data.length} location(s) for "${query}":\n${locationList}`,
      };

    } catch (error) {
      console.error('[searchLocationTool] Nominatim API error:', error);
      return {
        locations: [],
        geojson: null,
        message: `An error occurred while searching for "${query}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});