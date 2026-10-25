
import os
import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# TinyFish API configuration
TINYFISH_API_URL = os.environ.get(
    "TINYFISH_API_URL",
    "https://api.tinyfish.ai/v1/agent/run"
)
TINYFISH_API_KEY = os.environ.get(
    "TINYFISH_API_KEY",
    "your-tinyfish-api-key-here"
)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/search-partners", methods=["POST"])
def search_partners():
    data = request.json or {}

    location = data.get("location", "")
    food_type = data.get("foodType", "")
    quantity = data.get("quantity", "")
    availability = data.get("availability", "")

    prompt = (
        f"Find local charities, food banks, shelters, or community kitchens "
        f"in or near {location} that may accept surplus food donations "
        f"such as {quantity} of {food_type}. "
        f"Find their names, contact details, donation policies, and "
        f"direct public source URLs. Do not claim acceptance without confirmation."
    )

    headers = {
        "Authorization": f"Bearer {TINYFISH_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "prompt": prompt,
        "url": (
            "https://www.google.com/search?q="
            f"food+banks+shelters+donation+{location}"
        )
    }

    try:
        if TINYFISH_API_KEY == "your-tinyfish-api-key-here":
            results = get_mock_tinyfish_results(
                location, food_type, quantity
            )
        else:
            response = requests.post(
                TINYFISH_API_URL,
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            results = response.json().get("results", [])

        return jsonify({
            "status": "success",
            "data": results,
            "availability_requested": availability
        })

    except requests.RequestException:
        return jsonify({
            "status": "error",
            "message": "Could not connect to the TinyFish service."
        }), 502


def get_mock_tinyfish_results(location, food_type, quantity):
    """Return clearly labelled example data for interface testing."""
    return [
        {
            "name": "Example Food Bank (Demo)",
            "distance": "Not verified",
            "note": f"Example match for {food_type}; acceptance is not verified.",
            "timing": "Contact the organisation to confirm",
            "source_url": "https://example.org/"
        },
        {
            "name": "Example Community Kitchen (Demo)",
            "distance": "Not verified",
            "note": f"Example listing for {quantity} of surplus food.",
            "timing": "Collection time not verified",
            "source_url": "https://example.org/"
        }
    ]


if __name__ == "__main__":
    app.run(debug=True, port=5000)
  
