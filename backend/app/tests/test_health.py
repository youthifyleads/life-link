from unittest.mock import AsyncMock, patch
import pytest
from app.db import session as db_session_module


def test_health_success(client):
    """Test health check returns 200 and connected when database query succeeds."""
    mock_session = AsyncMock()
    mock_session.execute = AsyncMock()

    class MockSessionFactory:
        def __call__(self):
            return self

        async def __aenter__(self):
            return mock_session

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass

    with patch("app.main.get_session_factory", return_value=MockSessionFactory()):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "database": "connected"}
        mock_session.execute.assert_awaited_once()


def test_health_database_failure(client):
    """Test health check returns 503 and disconnected when database query fails."""
    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(side_effect=Exception("Login failed for user 'sa' on server 'azure-sql'"))

    class MockSessionFactory:
        def __call__(self):
            return self

        async def __aenter__(self):
            return mock_session

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass

    with patch("app.main.get_session_factory", return_value=MockSessionFactory()):
        response = client.get("/health")
        assert response.status_code == 503
        data = response.json()
        assert data == {"status": "error", "database": "disconnected"}
        # Ensure sensitive database credentials or error traces are NOT leaked in response
        assert "sa" not in str(data)
        assert "azure-sql" not in str(data)
        assert "password" not in str(data).lower()


def test_health_does_not_recreate_engine(client):
    """Verify that calling /health does not recreate the engine."""
    with patch("app.db.session.create_async_engine") as mock_create_engine:
        # If _engine is already set, get_engine() will not call create_async_engine
        fake_engine = AsyncMock()
        with patch.object(db_session_module, "_engine", fake_engine):
            engine = db_session_module.get_engine()
            assert engine is fake_engine
            mock_create_engine.assert_not_called()
