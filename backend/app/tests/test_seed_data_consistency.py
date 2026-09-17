"""
Guards against the exact class of bug the team review flagged: the SQL
Server dev-seed script (scripts/seed_dev.py) and the in-memory dev/test
repository (app/repositories/memory/user_repository.py) drifting apart, so
an account (e.g. admin) logs in during tests but not on a real deployment.

This does not need a live database - it only imports the two Python
sources of truth and compares them.
"""
import sys
from pathlib import Path

# scripts/ is not a package; import it by path.
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
import seed_dev  # noqa: E402

from app.repositories.memory.user_repository import InMemoryUserRepository


def test_seed_dev_and_memory_repo_have_the_same_accounts():
    seed_emails = {u[1] for u in seed_dev.SEED_USERS}
    memory_repo = InMemoryUserRepository()
    memory_emails = {u.email for u in memory_repo._users.values()}
    assert seed_emails == memory_emails, (
        "scripts/seed_dev.py and the in-memory dev repository seed different "
        "accounts - a login that works in tests may not work against a real "
        "SQL Server deployment (or vice versa)."
    )


def test_seed_dev_accounts_match_documented_qa_accounts():
    qa_doc = (Path(__file__).resolve().parents[2] / "docs" / "QA_TEST_ACCOUNTS.md").read_text()
    for _uid, email, _name, _role, _hosp, _bank, _password, _status in seed_dev.SEED_USERS:
        assert email in qa_doc, f"{email} is seeded but not documented in docs/QA_TEST_ACCOUNTS.md"


def test_admin_account_is_seeded():
    seed_emails = {u[1] for u in seed_dev.SEED_USERS}
    assert "admin@lifelink.dev" in seed_emails
