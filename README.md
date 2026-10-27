# Text Steganography — Full Stack Project

A small full-stack demo that hides a secret message inside ordinary cover text using invisible Unicode characters. The frontend calls a Python FastAPI backend over HTTP.

## Tech stack

- **Backend:** Python, FastAPI, Pydantic
- **Frontend:** HTML5, CSS3, JavaScript (Fetch API)
- **Testing:** pytest, FastAPI TestClient
- **Deployment:** Docker-ready backend

## Features

- Hide a message in visible cover text.
- Extract a hidden message from encoded text.
- REST API with request validation and useful error responses.
- Health-check endpoint and interactive Swagger docs.
- Responsive UI and copy-to-clipboard button.
- Automated API tests.

## Project structure

```text
text_steganography_fullstack/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── test_main.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── README.md
```

## Run locally

### 1. Start the API

Open a terminal:

```bash
cd backend
python -m venv .venv
```

Activate the environment:

- Windows PowerShell: `.\.venv\Scripts\Activate.ps1`
- macOS/Linux: `source .venv/bin/activate`

Install dependencies and start the server:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

API: `http://127.0.0.1:8000`  
Swagger documentation: `http://127.0.0.1:8000/docs`

### 2. Open the frontend

Open `frontend/index.html` in your browser. The default API URL is `http://127.0.0.1:8000`.

If the browser blocks requests when opening the file directly, serve the frontend from its folder in a second terminal:

```bash
python -m http.server 5500
```

Then open `http://127.0.0.1:5500`.

### 3. Run tests

From the `backend` folder, install the test dependencies and run:

```bash
pip install pytest httpx
pytest -q
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API welcome message |
| GET | `/health` | Health check |
| POST | `/api/hide` | Hide a secret message |
| POST | `/api/extract` | Extract a hidden message |

Example request to `/api/hide`:

```json
{
  "cover_text": "Have a nice day!",
  "secret_message": "Meet me at 5."
}
```

## Docker

From the `backend` directory:

```bash
docker build -t text-steganography-api .
docker run --rm -p 8000:8000 text-steganography-api
```

## Deployment notes

- Deploy the backend as a Docker web service, or use any host that supports Python.
- Deploy `frontend/` as a static site.
- Set `API_BASE` in `frontend/app.js` to the public HTTPS URL of the deployed API before deploying the frontend.
- In production, replace the permissive CORS configuration with the exact frontend origin.

## Important limitations

This is an educational steganography demo, **not encryption**. Anyone who knows the encoding method may extract the message. The invisible payload may be removed by messaging apps, text editors, or sanitizers. Do not use it to protect passwords or sensitive data.
