import requests
from flask import Flask, render_template, jsonify

app = Flask(__name__)
API_KEY = '218fcda7c311cd6a179bce1d'
API_URL = f"https://er-api.com?apikey={API_KEY}"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get_supported_currencies")
def get_supported_currencies():
    try:
        response = requests.get(f"{API_URL}/supported", timeout=10)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({"Error": "Failed to fetch rate", "details": str(e)}), 500



@app.route("/get_rate/<base_currency>")
def get_rate(base_currency):
    try:
        response = requests.get(f"{API_URL}?from{base_currency}", timeout=10)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({"Error": "Failed to fetch rate", "details": str(e)}), 500
    
if __name__ == "main":
    app.run(debug=True)