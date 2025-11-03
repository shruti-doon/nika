/**
 * Helper function to extract clean place name (name + one word address)
 */
export const getCleanPlaceName = (displayName: string): string => {
  if (!displayName) return 'Location'
  
  // Split by comma - first part is usually the name, rest is address
  const parts = displayName.split(',').map(p => p.trim())
  
  if (parts.length === 0) return displayName
  if (parts.length === 1) return parts[0]
  
  // Take the name (first part) and the city/area (usually second-to-last or last)
  const name = parts[0]
  const city = parts.length > 2 ? parts[parts.length - 2] : parts[parts.length - 1]
  
  // Return name and city if city is short, otherwise just name
  if (city && city.length < 20) {
    return `${name}, ${city}`
  }
  return name
}

/**
 * Transform Nominatim API response to GeoJSON format
 */
export const transformToGeoJSON = (data: any[]) => {
  const features = data.map((item: any) => ({
    type: 'Feature' as const,
    properties: {
      name: item.display_name,
      type: item.type,
      importance: item.importance,
    },
    geometry: item.geojson || {
      type: 'Point' as const,
      coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
    },
  }))

  return {
    type: 'FeatureCollection' as const,
    features,
  }
}

/**
 * Format location names as a bullet list
 */
export const formatLocationList = (locations: any[]): string => {
  const placeNames = locations.map((item: any) => getCleanPlaceName(item.display_name))
  return placeNames.map((name: string) => `• ${name}`).join('\n')
}

/**
 * Make a request to Nominatim API
 */
export const fetchNominatim = async (url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NikaLocationChatbot/1.0',
      },
    })
    
    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status} ${response.statusText}`)
      return []
    }
    
    const data = await response.json()
    
    // Handle rate limiting
    if (response.status === 429) {
      console.error('Nominatim API rate limited. Please wait a moment.')
      return []
    }
    
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching from Nominatim:', error)
    return []
  }
}

