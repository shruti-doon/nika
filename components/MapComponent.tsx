'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Wait a bit to ensure container is rendered
    const timer = setTimeout(() => {
      if (!mapContainer.current || map.current) return

      try {
        // Use OpenStreetMap tiles as a more reliable alternative
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: [
                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                ],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
              }
            },
            layers: [
              {
                id: 'osm-tiles-layer',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19
              }
            ]
          },
          center: [77.2090, 28.6139], // Delhi coordinates as default
          zoom: 10
        })

        map.current.on('load', () => {
          setIsLoaded(true)
        })

        map.current.on('error', (e: any) => {
          console.error('Map error:', e)
        })

        return () => {
          if (map.current) {
            map.current.remove()
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  const addLocationLayer = (geojsonData: any, title?: string) => {
    if (!map.current || !isLoaded) return

    const sourceId = `location-source-${Date.now()}`
    const layerId = `location-layer-${Date.now()}`

    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId)
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId)
    }

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: geojsonData
    })

    const hasPolygons = geojsonData.features?.some((f: any) => 
      f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon'
    )
    const hasPoints = geojsonData.features?.some((f: any) => 
      f.geometry?.type === 'Point'
    )

    if (hasPolygons) {
      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.4
        }
      })

      map.current.addLayer({
        id: `${layerId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#088',
          'line-width': 3,
          'line-opacity': 1.0
        }
      })
      map.current.on('mouseenter', `${layerId}-outline`, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer'
          map.current.setPaintProperty(`${layerId}-outline`, 'line-width', 3)
        }
      })
      
      map.current.on('mouseleave', `${layerId}-outline`, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = ''
          map.current.setPaintProperty(`${layerId}-outline`, 'line-width', 2)
        }
      })
    }

    if (hasPoints) {
      const pointLayerId = hasPolygons ? `${layerId}-points` : layerId
      map.current.addLayer({
        id: pointLayerId,
        type: 'circle',
        source: sourceId,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 8,
          'circle-color': '#088',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      })
      
      map.current.on('click', pointLayerId, (e) => {
        const feature = e.features?.[0]
        if (feature) {
          const props = feature.properties || {}
          const name = props.name || props.display_name || title || 'Location'
          const fullAddress = props.display_name || props.name || name
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${name}</strong><br/><small style="color: #666;">${fullAddress}</small>`)
            .addTo(map.current!)
        }
      })
      
      map.current.on('mouseenter', pointLayerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer'
        }
      })
      
      map.current.on('mouseleave', pointLayerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = ''
        }
      })
    }

    if (hasPolygons) {
      map.current.on('click', layerId, (e) => {
        const feature = e.features?.[0]
        if (feature) {
          const props = feature.properties || {}
          const name = props.name || props.display_name || title || 'Location'
          const fullAddress = props.display_name || props.name || name
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${name}</strong><br/><small style="color: #666;">${fullAddress}</small>`)
            .addTo(map.current!)
        }
      })
      
      map.current.on('click', `${layerId}-outline`, (e) => {
        const feature = e.features?.[0]
        if (feature) {
          const props = feature.properties || {}
          const name = props.name || props.display_name || title || 'Location'
          const fullAddress = props.display_name || props.name || name
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${name}</strong><br/><small style="color: #666;">${fullAddress}</small>`)
            .addTo(map.current!)
        }
      })
      
      map.current.on('mouseenter', layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer'
        }
      })
      
      map.current.on('mouseleave', layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = ''
        }
      })
    }

    if (geojsonData.features?.length > 0) {
      const featureCount = geojsonData.features.length
      
      if (featureCount === 1) {
        const feature = geojsonData.features[0]
        if (feature.geometry.type === 'Point') {
          const [lng, lat] = feature.geometry.coordinates
          map.current.setCenter([lng, lat])
          map.current.setZoom(15)
        } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
          const bounds = new maplibregl.LngLatBounds()
          const coords = feature.geometry.type === 'Polygon' 
            ? feature.geometry.coordinates[0]
            : feature.geometry.coordinates[0][0]
          coords.forEach((coord: number[]) => {
            bounds.extend(coord as [number, number])
          })
          map.current.fitBounds(bounds, { padding: 50, maxZoom: 16 })
        }
      } else {
        const bounds = new maplibregl.LngLatBounds()
        geojsonData.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates
            bounds.extend([lng, lat])
          } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
            const coords = feature.geometry.type === 'Polygon' 
              ? feature.geometry.coordinates[0]
              : feature.geometry.coordinates[0][0]
            coords.forEach((coord: number[]) => {
              bounds.extend(coord as [number, number])
            })
          }
        })
        if (bounds.getNorth() === bounds.getSouth() && bounds.getEast() === bounds.getWest()) {
          const center = bounds.getCenter()
          bounds.extend([center.lng - 0.01, center.lat - 0.01])
          bounds.extend([center.lng + 0.01, center.lat + 0.01])
        }
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 16 })
      }
    }
  }

  const zoomToLocation = (feature: any, fullAddress: string) => {
    if (!map.current || !isLoaded) return
    
    if (feature.geometry.type === 'Point') {
      const [lng, lat] = feature.geometry.coordinates
      map.current.setCenter([lng, lat])
      map.current.setZoom(16)
      
      new maplibregl.Popup()
        .setLngLat([lng, lat])
        .setHTML(`<strong>${feature.properties?.name || 'Location'}</strong><br/><small style="color: #666;">${fullAddress}</small>`)
        .addTo(map.current)
    } else if (feature.geometry.type === 'Polygon') {
      const bounds = new maplibregl.LngLatBounds()
      feature.geometry.coordinates[0].forEach((coord: number[]) => {
        bounds.extend(coord as [number, number])
      })
      const center = bounds.getCenter()
      map.current.setCenter([center.lng, center.lat])
      map.current.setZoom(16)
      
      new maplibregl.Popup()
        .setLngLat([center.lng, center.lat])
        .setHTML(`<strong>${feature.properties?.name || 'Location'}</strong><br/><small style="color: #666;">${fullAddress}</small>`)
        .addTo(map.current)
    }
  }

  useEffect(() => {
    if (isLoaded && map.current) {
      ;(window as any).addLocationToMap = addLocationLayer
      ;(window as any).zoomToLocation = zoomToLocation
    }
  }, [isLoaded])

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        minHeight: '400px',
        backgroundColor: '#f0f0f0'
      }}
    />
  )
}

