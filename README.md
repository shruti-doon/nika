# Location Intelligence Chatbot

A location intelligence chatbot application that leverages Vercel AI SDK and OpenAI LLM to help Nika employees discover and visualize locations on an interactive map interface.

## Features

- **Interactive Map Interface**: MapLibreJS-powered map as the primary UI component with OpenStreetMap tile integration
- **AI Chatbot Interface**: Intelligent conversational interface with scrollable message history
- **Location Search**: Integrated tool calling with Nominatim API for comprehensive location, place, and address searches
- **GeoJSON Visualization**: Displays search results as both polygon regions and point markers on the map
- **Real-time Streaming**: Live streaming of AI responses for enhanced user experience
- **Reverse Geocoding**: Convert geographic coordinates to human-readable location addresses

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your-api-key-here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

The chatbot supports two main types of queries:

**Location Search**
- Search for specific places or addresses: "India Gate, New Delhi", "Eiffel Tower, Paris"
- Search for types of places with location context: "restaurants in Tokyo", "cafes in Delhi", "parks in New York"
- Requires: Specific place types (not generic terms) and location context (city, region, or country)

**Reverse Geocoding**
- Query coordinates to get location information: "What's at 40.7128, -74.0060?"
- Direct coordinate input: Enter latitude and longitude separated by comma (e.g., `40.7128, -74.0060`)

Search results are displayed on the map using GeoJSON layers. Users can click on location names in the chat interface to zoom to those locations on the map.

**Note**: Generic queries like "fun spots" or "hangout places" are not supported. Use specific place types (restaurant, cafe, park, museum) with location context.

## Project Structure

```
nika/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # AI SDK endpoint with tool calling
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main page
│   └── globals.css           # Global styles
├── components/
│   ├── MapComponent.tsx      # MapLibreJS map component
│   ├── Chatbot.tsx           # Chatbot UI component
│   └── *.module.css          # Component styles
├── lib/
│   ├── tools/
│   │   ├── searchLocation.tsx    # Location search tool
│   │   └── reverseGeocode.tsx    # Reverse geocoding tool
│   └── utils.ts                  # Utility functions for Nominatim
└── package.json
```

## Tech Stack

- **Next.js 14**: React framework with App Router
- **Vercel AI SDK**: For LLM integration and streaming
- **OpenAI GPT-5-mini**: Language model (using provided API key)
- **MapLibre GL JS**: Map rendering with OpenStreetMap tiles
- **Nominatim API**: Location search and reverse geocoding
- **TypeScript**: Type safety
- **Zod**: Schema validation for tool parameters

## Implementation Details

### Part 1: AI SDK Integration
- Configured Vercel AI SDK with OpenAI provider
- Secure authentication using environment variables
- Structured data format for queries and responses

### Part 2: Frontend Map Interface
- MapLibreJS map implementation with OpenStreetMap tiles
- Chatbot interface positioned as overlay on map (bottom-left corner)
- Scrollable conversation interface with message history
- Responsive and functional UI design

### Part 3: API Endpoints
- Secure API key management via environment variables
- GPT-5-mini model configuration
- Proper request/response handling and error management

### Part 4: Tool Calling Implementation
- Nominatim API integration through AI SDK tool calling mechanism
- GeoJSON format implementation for map layer rendering
- Support for both Polygon and Point geometry types
- Automatic map updates when tool results are received
- Interactive location names in chat that trigger map zoom

### Additional Features

**Real-time Streaming**
- AI responses stream in real-time using the `useChat` hook from AI SDK
- Enhanced user experience with progressive response rendering

**Reverse Geocoding**
- Dedicated tool for converting geographic coordinates to location addresses
- Supports direct coordinate input (e.g., `40.7128, -74.0060`)
- Displays formatted location names and addresses on the map

