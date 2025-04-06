# Agricult Flask Backend for Chatbot

This folder contains the Flask backend for the Agricult farming assistant chatbot. The server uses Google's Gemini 1.5 Pro model to provide AI-powered responses to agricultural queries.

## Features

- AI-powered farmer assistance chatbot using Gemini 1.5 Pro
- Plant disease detection using YOLO model
- CORS-enabled for cross-origin requests from the frontend

## Requirements

- Python 3.9+
- Flask and other dependencies (see requirements.txt)
- Google API key for Gemini 1.5 Pro
- YOLO model file (best.pt) for plant disease detection

## Setup

1. Install required Python packages:

```bash
pip install -r requirements.txt
```

2. Make sure the best.pt model file is in the same directory

## Running the Server

To start the Flask server:

```bash
python run_server.py
```

The server will run on http://localhost:5000

## API Endpoints

- `GET /` - Health check endpoint
- `POST /chat` - Send a message to the chatbot
  - Request body: `{ "query": "Your question here" }`
  - Response: `{ "response": "AI response text" }`

## Integration with Frontend

The Flask server is designed to work with the Agricult React Native frontend. To use it:

1. Run this Flask server
2. Start the React Native application
3. The chatbot in the frontend will automatically connect to this Flask server

## Troubleshooting

- If you get CORS errors, ensure the Flask server is running with CORS enabled
- If the model doesn't load, check that best.pt is in the correct location
- If you get authentication errors, verify your Google API key 