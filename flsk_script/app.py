from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key="AIzaSyBhgPS0QP_1DZrabpfqttB0ocf-P17Ds0s")

# Manually prepended instruction for the model
FARMER_INSTRUCTIONS = """
You are an AI assistant for Indian farmers.
You should ONLY answer questions related to:
1. Smart irrigation (based on weather forecasts).
2. Buying/selling crops directly in markets.
3. Farming practices like crops, soil, fertilizers, pests, and climate.

If a user asks something unrelated (e.g. politics, history, movies, tech), respond with:
"I'm here to help with farming and agriculture. Please ask something related to that."
"""

model = genai.GenerativeModel('gemini-1.5-pro')


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_query = data.get("query", "")

    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    try:
        # Combine farmer instructions + user query
        prompt = f"{FARMER_INSTRUCTIONS}\nUser: {user_query}\nAssistant:"

        response = model.generate_content(prompt)
        return jsonify({"response": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def index():
    return "🌾 Gemini 1.5 Farmer Chatbot is running!"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
