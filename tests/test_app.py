from app import app


def test_homepage():
    client = app.test_client()

    response = client.get("/")

    assert response.status_code == 200

def test_get_rates():
    client = app.test_client()

    response = client.get("/get_rates/USD")

    assert response.status_code == 200
