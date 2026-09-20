import requests
from flask import Flask, render_template, jsonify

app = Flask(__name__)

API_URL = "https://open.er-api.com/v6/latest"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/get_rates/<base_currency>")
def get_rate(base_currency):
    try:
        response = requests.get(
            f"{API_URL}/{base_currency}",
            timeout=10
        )

        response.raise_for_status()

        return jsonify(response.json())

    except Exception as e:
        return jsonify({
            "error": "Failed to fetch rates",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
