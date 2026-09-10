"""Password hashing with Passlib compatibility and a stdlib fallback for tests."""
from __future__ import annotations
import base64
import hashlib
import hmac
import os

try:
    from passlib.context import CryptContext
except ImportError:  # local/minimal environments may not have optional dependency installed
    CryptContext = None

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto") if CryptContext else None


def hash_password(password: str) -> str:
    if pwd_context:
        return pwd_context.hash(password)
    salt = os.urandom(16)
    iterations = 310_000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return f"pbkdf2_sha256$${iterations}${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if hashed_password.startswith("pbkdf2_sha256$$"):
        try:
            _, _, iterations, salt_b64, digest_b64 = hashed_password.split("$", 4)
            salt = base64.urlsafe_b64decode(salt_b64.encode())
            expected = base64.urlsafe_b64decode(digest_b64.encode())
            actual = hashlib.pbkdf2_hmac("sha256", plain_password.encode(), salt, int(iterations))
            return hmac.compare_digest(actual, expected)
        except (ValueError, TypeError):
            return False
    if pwd_context:
        return pwd_context.verify(plain_password, hashed_password)
    return False
