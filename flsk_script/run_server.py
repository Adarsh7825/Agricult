import os
from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS

# Import app from app.py
from app import app

# Enable CORS for all routes
CORS(app)

if __name__ == '__main__':
    # Run on all interfaces, port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
