from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal
import base64
import binascii

app = FastAPI(
    title="Text Steganography API",
    description="Hide a message inside ordinary text using invisible Unicode characters.",
    version="1.0.0",
)

# For local development. Restrict this to your deployed frontend domain in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ZERO_WIDTH_SPACE = "\u200b"
ZERO_WIDTH_NON_JOINER = "\u200c"
MARKER_START = "\u2063\u2063"
MARKER_END = "\u2064\u2064"


class HideRequest(BaseModel):
    cover_text: str = Field(min_length=1, max_length=10000)
    secret_message: str = Field(min_length=1, max_length=2000)


class ExtractRequest(BaseModel):
    text: str = Field(min_length=1, max_length=20000)


def encode_bits(message: str) -> str:
    payload = base64.b64encode(message.encode("utf-8")).decode("ascii")
    return "".join(f"{byte:08b}" for byte in payload.encode("ascii"))


def hide_message(cover_text: str, secret_message: str) -> str:
    bits = encode_bits(secret_message)
    hidden = "".join(
        ZERO_WIDTH_SPACE if bit == "0" else ZERO_WIDTH_NON_JOINER
        for bit in bits
    )
    # Append a marked payload so extraction does not depend on cover-text formatting.
    return cover_text + MARKER_START + hidden + MARKER_END


def extract_message(text: str) -> str:
    start = text.rfind(MARKER_START)
    if start < 0:
        raise ValueError("No hidden message marker was found in this text.")
    end = text.find(MARKER_END, start + len(MARKER_START))
    if end < 0:
        raise ValueError("The hidden message appears incomplete or damaged.")

    hidden = text[start + len(MARKER_START):end]
    bits = []
    for char in hidden:
        if char == ZERO_WIDTH_SPACE:
            bits.append("0")
        elif char == ZERO_WIDTH_NON_JOINER:
            bits.append("1")
        # Ignore other characters in the marked section.

    if not bits or len(bits) % 8 != 0:
        raise ValueError("Hidden data is incomplete or invalid.")

    raw = bytes(int("".join(bits[i:i + 8]), 2) for i in range(0, len(bits), 8))
    try:
        decoded_payload = raw.decode("ascii")
        return base64.b64decode(decoded_payload, validate=True).decode("utf-8")
    except (UnicodeDecodeError, binascii.Error, ValueError) as exc:
        raise ValueError("Could not decode the hidden message.") from exc


@app.get("/")
def root():
    return {"message": "Text Steganography API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/hide")
def hide(request: HideRequest):
    if not request.cover_text.strip():
        raise HTTPException(status_code=422, detail="Cover text cannot be blank.")
    if not request.secret_message:
        raise HTTPException(status_code=422, detail="Secret message cannot be blank.")
    return {
        "encoded_text": hide_message(request.cover_text, request.secret_message),
        "message": "Secret message hidden successfully.",
    }


@app.post("/api/extract")
def extract(request: ExtractRequest):
    try:
        secret = extract_message(request.text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"secret_message": secret, "message": "Hidden message extracted successfully."}
