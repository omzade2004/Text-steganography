from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_hide_then_extract_round_trip():
    hidden = client.post("/api/hide", json={
        "cover_text": "Have a nice day!",
        "secret_message": "Meet me at 5."
    })
    assert hidden.status_code == 200
    encoded_text = hidden.json()["encoded_text"]
    assert "Have a nice day!" in encoded_text

    extracted = client.post("/api/extract", json={"text": encoded_text})
    assert extracted.status_code == 200
    assert extracted.json()["secret_message"] == "Meet me at 5."


def test_extract_without_hidden_data_returns_400():
    response = client.post("/api/extract", json={"text": "Nothing is hidden here."})
    assert response.status_code == 400


def test_validation_rejects_empty_fields():
    response = client.post("/api/hide", json={
        "cover_text": "Visible text",
        "secret_message": ""
    })
    assert response.status_code == 422
