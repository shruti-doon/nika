'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from 'ai/react'
import styles from './Chatbot.module.css'

export default function Chatbot() {
  const processedToolCalls = useRef<Set<string>>(new Set())
  const [locationData, setLocationData] = useState<Map<string, any>>(new Map())
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    messages.forEach((message) => {
      if (message.role === 'assistant' && message.toolInvocations && message.toolInvocations.length > 0) {
        message.toolInvocations.forEach((toolInvocation: any) => {
          const toolCallId = `${message.id}-${toolInvocation.toolCallId}`
          
          if (!processedToolCalls.current.has(toolCallId) && toolInvocation.state === 'result') {
            processedToolCalls.current.add(toolCallId)
            
            const result = toolInvocation.result as any
            
            if (['searchLocation', 'reverseGeocode'].includes(toolInvocation.toolName) && result.geojson) {
              if (typeof window !== 'undefined' && (window as any).addLocationToMap) {
                try {
                  const geojson = typeof result.geojson === 'string' 
                    ? JSON.parse(result.geojson) 
                    : result.geojson
                  const title = result.query || result.message || 'Location'
                  ;(window as any).addLocationToMap(geojson, title)
                  
                  if (geojson.features) {
                    setLocationData((prev) => {
                      const newLocationData = new Map(prev)
                      geojson.features.forEach((feature: any) => {
                        const name = feature.properties?.name || feature.properties?.display_name || 'Location'
                        newLocationData.set(name, feature)
                        const cleanName = name.split(',')[0].trim()
                        if (cleanName !== name) {
                          newLocationData.set(cleanName, feature)
                        }
                      })
                      return newLocationData
                    })
                  }
                } catch (e) {
                  console.error('Error parsing GeoJSON:', e)
                }
              }
            }
          }
        })
      }
    })
  }, [messages])

  return (
    <div className={styles.chatbot}>
      <div className={styles.header}>
        <h2>Location Assistant</h2>
      </div>
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <p>Try locations you wanna look for !</p>
            <p>if you have coordinates, you can get the location information just enter them for example 40.7128, -74.0060</p>
          </div>
        )}
        {messages.map((message) => {
          if (message.role === 'user') {
            return (
              <div key={message.id}>
                <div className={`${styles.message} ${styles.userMessage}`}>
                  <div className={styles.messageContent}>
                    {message.content || '(Empty message)'}
                  </div>
                </div>
              </div>
            )
          }
          
          const hasContent = message.content && message.content.trim().length > 0
          const hasToolInvocations = message.toolInvocations && message.toolInvocations.length > 0
          
          let toolMessages: string[] = []
          if (hasToolInvocations && message.toolInvocations) {
            message.toolInvocations.forEach((toolInv: any) => {
              if (toolInv.state === 'result' && toolInv.result) {
                const result = toolInv.result as any
                if (result.message) {
                  toolMessages.push(result.message)
                }
              } else if (toolInv.state === 'call') {
                toolMessages.push(`Searching for ${toolInv.args?.query || 'locations'}...`)
              }
            })
          }
          
          if (!hasContent && !hasToolInvocations) {
            return null
          }
          
          const displayContent = hasContent 
            ? message.content 
            : toolMessages.length > 0 
              ? toolMessages.join('\n')
              : 'Processing location search...'
          
          const renderContentWithClickableLocations = (content: string) => {
            const lines = content.split('\n')
            return lines.map((line, index) => {
              if (line.trim().startsWith('•')) {
                const locationName = line.trim().substring(1).trim()
                let matchingLocation: any = null
                const cleanLocationName = locationName.split(',')[0].trim().toLowerCase()
                
                locationData.forEach((feature, key) => {
                  const cleanKey = key.split(',')[0].trim().toLowerCase()
                  if (cleanLocationName === cleanKey || 
                      cleanLocationName.includes(cleanKey) || 
                      cleanKey.includes(cleanLocationName)) {
                    matchingLocation = feature
                  }
                })
                
                if (matchingLocation) {
                  return (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      <span
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          color: '#088',
                          fontWeight: 500
                        }}
                        onClick={() => {
                          if (typeof window !== 'undefined' && (window as any).zoomToLocation) {
                            const fullAddress = matchingLocation.properties?.name || matchingLocation.properties?.display_name || locationName
                            ;(window as any).zoomToLocation(matchingLocation, fullAddress)
                          }
                        }}
                      >
                        {line}
                      </span>
                    </div>
                  )
                }
              }
              return <div key={index}>{line}</div>
            })
          }
          
          return (
            <div key={message.id}>
              <div className={`${styles.message} ${styles.assistantMessage}`}>
                <div className={styles.messageContent}>
                  {hasContent ? renderContentWithClickableLocations(displayContent) : displayContent}
                  {hasContent && hasToolInvocations && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      {toolMessages.length > 0 && toolMessages.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.messageContent}>
              <span className={styles.typing}>Thinking...</span>
            </div>
          </div>
        )}
        {error && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.messageContent} style={{ color: '#d32f2f' }}>
              Error: {error.message || 'Something went wrong. Please try again.'}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about locations..."
          className={styles.input}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className={styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  )
}

