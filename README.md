# Nika Location Intelligence Chatbot

A location intelligence chatbot that uses Vercel AI SDK and OpenAI LLM to display different locations on a map as recommendations for Nika employees.

## Features

- **Interactive Map**: MapLibreJS map as the centerpiece of the UI
- **Chatbot Interface**: AI-powered chatbot for location queries with scrollable conversation
- **Location Search**: Tool calling integration with Nominatim API for searching locations, places, and addresses
- **GeoJSON Display**: Shows search results as polygons and points on the map
- **Streaming Responses**: Real-time streaming of AI responses (Bonus ✅)
- **Reverse Geocoding**: Convert coordinates to location addresses (Bonus ✅)

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

Ask the chatbot questions like:
- "Find coffee shops in Paris"
- "Show me restaurants in Tokyo"
- "Where can I find parks in New York?"
- "Search for India Gate in New Delhi"
- "What's at coordinates 40.7128, -74.0060?" (reverse geocoding)
- Enter coordinates directly like: `40.7128, -74.0060`

The chatbot will automatically use the appropriate tool to search for locations and display them on the map with GeoJSON layers. Click on location names in the chat to zoom to them on the map.

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

### Part 1: AI SDK ✅
- Configured Vercel AI SDK with OpenAI provider
- Authenticated requests using environment variable
- Proper data format for queries and responses

### Part 2: Frontend Map Interface ✅
- MapLibreJS map as the centerpiece
- Chatbot positioned over the map (bottom-left)
- Scrollable conversation display
- Clean, functional UI

### Part 3: API Endpoints ✅
- Secure API key handling via environment variables
- GPT-5-mini model configuration
- Proper request/response processing

### Part 4: Tool Calling ✅
- Nominatim API integration via tool calling
- GeoJSON format for map layers
- Polygon and Point geometry support
- Automatic map updates on tool results
- Clickable location names in chat to zoom on map

### Bonus Features ✅
1. **Streaming**: Responses stream in real-time using `useChat` hook from AI SDK
2. **Reverse Geocoding**: Tool to convert coordinates to location addresses
   - Users can enter coordinates (e.g., `40.7128, -74.0060`) to get location information
   - Displays location name and address on the map

