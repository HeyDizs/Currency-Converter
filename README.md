# Currency Converter

A simple web-based currency converter built with Flask. The application retrieves current exchange rates from an external currency exchange API and provides a simple interface for currency conversion.

## Features

* Currency conversion
* Exchange-rate retrieval through an external API
* Responsive web interface
* Automated tests with pytest
* Continuous Integration with GitHub Actions
* Production deployment with Gunicorn and Render

## Project Structure

```text
Currency-Converter/
├── app.py
├── static/
│   └── bg.png
├── templates/
│   └── index.html
├── tests/
│   └── test_app.py
├── requirements.txt
├── .gitignore
└── .github/
    └── workflows/
        └── ci.yml
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/HeyDizs/Currency-Converter.git
cd Currency-Converter
```

### 2. Create a virtual environment

```bash
python3 -m venv venv
```

### 3. Activate the virtual environment

Linux/macOS:

```bash
source venv/bin/activate
```

Windows:

```bash
venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

## Run the Application Locally

```bash
python app.py
```

The application will be available at:

```text
http://127.0.0.1:5000
```

## Run Tests

Run the automated test suite with:

```bash
python -m pytest
```

The project uses pytest to test the Flask application and currency-rates endpoint.

## Continuous Integration

GitHub Actions automatically runs the test suite when code is pushed to `main` or when a pull request targets `main`.

The workflow:

1. Checks out the repository
2. Sets up Python
3. Installs project dependencies
4. Runs the pytest test suite

Workflow file:

```text
.github/workflows/ci.yml
```

## Deployment

The application is deployed as a Flask web service using Gunicorn and Render.

Production start command:

```bash
gunicorn app:app
```

Live application:

https://currency-converter-r1ha.onrender.com

## Development Notes

The Python virtual environment (`venv/`) and environment files such as `.env` are excluded from version control through `.gitignore`.

Do not commit passwords, API keys, tokens, or other secrets to the repository.

