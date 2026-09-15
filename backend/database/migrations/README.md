# Shared Database Migrations

> **Notice**: The authoritative database migrations for the project reside in the root [`database/migrations/`](../../database/migrations/) directory.

Backend SQLAlchemy models in `app/db/models.py` mirror the deployed schema. Alembic is retained only for local/bootstrap compatibility and must not become a second independent production schema history.

When a schema change is approved:
1. The authoritative SQL migration is committed to `database/migrations/`.
2. Backend updates SQLAlchemy ORM models in `app/db/models.py`.
3. Repository mappers and pytest suite are updated and verified.

## Status of `notifications.related_request_id`

The additive column `notifications.related_request_id` has been formally incorporated into the database schema:
- Implemented as migration [`database/migrations/006_add_notifications_related_request_id.sql`](../../database/migrations/006_add_notifications_related_request_id.sql).
- Included in the consolidated [`database/LifeLink_Full_Database.sql`](../../database/LifeLink_Full_Database.sql).
- Configured with Foreign Key to `blood_requests(blood_request_id) ON DELETE SET NULL` and an index `ix_notifications_related_request_id`.
- Mapped in ORM model [`app/db/models.py`](../app/db/models.py) (`NotificationModel.related_request_id`).


