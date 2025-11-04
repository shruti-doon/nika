import { tool } from 'ai'
import { z } from 'zod'
import { fetchNominatim, transformToGeoJSON, formatLocationList } from '../utils'

export const searchLocationTool = tool({
 
  description: [
    'Search for a specific location or address by name.',
    'Use this tool when a user asks to find a specific place, get its coordinates, or see it on a map.',
    'Examples: "Eiffel Tower, Paris", "Red Fort, Delhi", "Times Square, New York".',
  ].join('\n'),

 
  parameters: z.object({
    query: z.string().describe(
      [
        'The search query string for the Nominatim (OpenStreetMap) API.',
        '---',
        'INSTRUCTIONS FOR THE LLM:',
        'The quality of this query is critical. You MUST follow these rules:',
        
        '1. PROVIDE CONTEXT: You MUST *always* include a city, region, or country with the location name.',
        '   - GOOD: "Eiffel Tower, Paris"',
        '   - GOOD: "Red Fort, Delhi"',
        '   - BAD: "Eiffel Tower" (missing city)',
        '   - BAD: "Red Fort" (missing city)',

        '2. HOW TO HANDLE FAILURES (YOUR RESPONSIBILITY):',
        '   If this tool returns "No locations found", DO NOT give up and tell the user you failed.',
        '   It is YOUR job to try again. Call this tool *again* with a different, rephrased query using alternative names or variations.',
        '   - Example 1: If "Statue of Equality Hyderabad" fails, try "Ramanuja Statue Hyderabad" or "Ramanuja Statue of Equality".',
        '   - Example 2: If the full name fails, try searching with just the main part of the name (e.g., if "XYZ Monument" fails, try just "XYZ").',
        '   - Example 3: If "Taj Mahal, Agra" fails, try "Taj Mahal" or "Taj Mahal Agra India".',
        '   - ALWAYS try at least 2-3 different query variations before giving up.',
        
        'This tool only executes the query you provide. YOU are responsible for the query strategy and MUST retry with variations.'
      ].join('\n')
    ),
  }),

  execute: async ({ query }) => {
    try {
      // Make API request with the query provided by the LLM
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&polygon_geojson=1`;
      const data: any[] = await fetchNominatim(url);

      // If no results, return failure - let LLM handle retries
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