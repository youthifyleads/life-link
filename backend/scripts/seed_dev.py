"""Seed roles, permissions, institutions and demo users into SQL Server."""
import asyncio
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.domain import Role
from app.core.hashing import hash_password
from app.db.models import BloodBankModel, HospitalModel, HospitalPhoneModel, BloodBankPhoneModel, PermissionModel, RoleModel, UserModel, UserPhoneModel, role_permissions
from app.db.session import get_session_factory

# Module-level so it can be diffed against docs/QA_TEST_ACCOUNTS.md and the
# in-memory dev repository (app/repositories/memory/user_repository.py) in a
# test, without needing a live SQL Server connection. Keeping this list and
# that repository in sync by hand previously caused the admin account to be
# missing from this script while tests/docs assumed it existed everywhere.
# (uid, email, name, role, hospital_id_ref, blood_bank_id_ref, password, status)
# hospital_id_ref/blood_bank_id_ref are "hospital_1"/"bloodbank_1" markers,
# resolved to the actual seeded row IDs in main() below.
SEED_USERS = [
    ("usr_admin_1", "admin@lifelink.dev", "Admin Demo", Role.ADMIN, None, None, "Admin@123", "active"),
    ("usr_hospital_1", "hospital@lifelink.dev", "Hospital Staff Demo", Role.HOSPITAL_USER, "hospital_1", None, "Hospital@123", "active"),
    ("usr_bloodbank_1", "bloodbank@lifelink.dev", "Blood Bank Demo", Role.BLOOD_BANK_OPERATOR, None, "bloodbank_1", "BloodBank@123", "active"),
    ("usr_normal_1", "user@lifelink.dev", "Normal User Demo", Role.NORMAL_USER, None, None, "NormalUser@123", "active"),
    ("usr_banned_1", "banned@lifelink.dev", "Banned User Demo", Role.NORMAL_USER, None, None, "BannedUser@123", "banned"),
]

# Dev OTP phone mappings for mobile QA.
SEED_PHONE_MAP = {"usr_normal_1": "01000000003", "usr_banned_1": "01000000004"}


async def main() -> None:
    async with get_session_factory()() as session:
        roles = {}
        descriptions = {
            Role.HOSPITAL_USER: "Hospital staff",
            Role.NORMAL_USER: "Patient / donor",
            Role.BLOOD_BANK_OPERATOR: "Blood bank staff",
            Role.MEDICAL_LEAD: "Clinical decision maker",
            Role.ADMIN: "System administrator",
            Role.PLATFORM_SUPPORT: "Platform support",
        }
        for role in Role:
            obj = (await session.execute(select(RoleModel).where(RoleModel.name == role.value))).scalar_one_or_none()
            if obj is None:
                obj = RoleModel(role_id=f"role_{role.value}", name=role.value, description=descriptions[role])
                session.add(obj)
            roles[role] = obj

        permission_names = [
            "requests:create", "requests:view", "requests:manage",
            "inventory:view", "inventory:update", "qr:scan",
            "notifications:view", "users:manage", "audit:view",
        ]
        permissions = {}
        for name in permission_names:
            obj = (await session.execute(select(PermissionModel).where(PermissionModel.name == name))).scalar_one_or_none()
            if obj is None:
                obj = PermissionModel(permission_id=f"perm_{name.replace(':','_')}", name=name, description=name)
                session.add(obj)
            permissions[name] = obj
        await session.flush()
        role_permissions_map = {
            Role.HOSPITAL_USER: ["requests:create", "requests:view", "notifications:view"],
            Role.BLOOD_BANK_OPERATOR: ["requests:view", "requests:manage", "inventory:view", "inventory:update", "qr:scan", "notifications:view"],
            Role.MEDICAL_LEAD: ["requests:view", "requests:manage", "qr:scan"],
            Role.ADMIN: permission_names,
            Role.PLATFORM_SUPPORT: ["requests:view", "inventory:view", "notifications:view", "audit:view"],
            Role.NORMAL_USER: ["notifications:view"],
        }
        for role, names in role_permissions_map.items():
            roles[role].permissions = [permissions[n] for n in names]

        hospital = (await session.execute(select(HospitalModel).where(HospitalModel.hospital_id == "hospital_1"))).scalar_one_or_none()
        if hospital is None:
            hospital = HospitalModel(hospital_id="hospital_1", name="Life Link Demo Hospital", address="Cairo", governorate="Cairo", status="active")
            session.add(hospital)
            session.add(HospitalPhoneModel(hospital_id="hospital_1", phone="01000000001"))
        blood_bank = (await session.execute(select(BloodBankModel).where(BloodBankModel.blood_bank_id == "bloodbank_1"))).scalar_one_or_none()
        if blood_bank is None:
            blood_bank = BloodBankModel(blood_bank_id="bloodbank_1", name="Life Link Demo Blood Bank", address="Cairo", governorate="Cairo", status="active")
            session.add(blood_bank)
            session.add(BloodBankPhoneModel(blood_bank_id="bloodbank_1", phone="01000000002"))
        await session.flush()

        for uid, email, name, role, hospital_ref, bank_ref, password, user_status in SEED_USERS:
            exists = (await session.execute(select(UserModel).where(UserModel.user_id == uid))).scalar_one_or_none()
            if exists is None:
                session.add(UserModel(
                    user_id=uid, email=email, password_hash=hash_password(password), name=name,
                    status=user_status, created_at=datetime.now(timezone.utc), role_id=roles[role].role_id,
                    hospital_id=hospital.hospital_id if hospital_ref else None,
                    blood_bank_id=blood_bank.blood_bank_id if bank_ref else None,
                ))
        for uid, phone in SEED_PHONE_MAP.items():
            exists_phone = (await session.execute(select(UserPhoneModel).where(UserPhoneModel.user_id == uid, UserPhoneModel.phone == phone))).scalar_one_or_none()
            if exists_phone is None:
                session.add(UserPhoneModel(user_id=uid, phone=phone))
        await session.commit()
    print("Seed complete. QA accounts are documented in docs/QA_TEST_ACCOUNTS.md")


if __name__ == "__main__":
    asyncio.run(main())
