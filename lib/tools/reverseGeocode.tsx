import { tool } from 'ai'
import { z } from 'zod'
import { transformToGeoJSON } from '../utils'

export const reverseGeocodeTool = tool({
  description: 'Get location information from coordinates (latitude and longitude). Use this when user provides coordinates or wants to know what is at a specific location.',
  parameters: z.object({
    lat: z.number().describe('Latitude'),
    lon: z.number().describe('Longitude'),
  }),
  execute: async ({ lat, lon }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'NikaLocationChatbot/1.0',
          },
        }
      )
      const data = await response.json()
      
      if (!data || !data.display_name) {
        return {
          location: null,
          message: `No location information found for coordinates (${lat}, ${lon})`,
        }
      }

      const geojson = transformToGeoJSON([data])

      return {
        location: data,
        geojson: JSON.stringify(geojson),
        message: `Location: ${data.display_name}`,
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return {
        location: null,
        message: `Error reverse geocoding: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  },
})

