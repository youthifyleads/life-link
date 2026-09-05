"""Seed roles, permissions, institutions and demo users into SQL Server."""
import asyncio
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.domain import Role
from app.core.hashing import hash_password
from app.db.models import BloodBankModel, HospitalModel, HospitalPhoneModel, BloodBankPhoneModel, PermissionModel, RoleModel, UserModel, UserPhoneModel, role_permissions
from app.db.session import get_session_factory


async def main() -> None:
    async with get_session_factory()() as session:
        roles = {}
        descriptions = {
            Role.HOSPITAL_USER: "Hospital staff",
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

        users = [
            ("usr_hospital_1", "hospital@lifelink.dev", "Hospital Staff Demo", Role.HOSPITAL_USER, hospital.hospital_id, None),
            ("usr_bloodbank_1", "bloodbank@lifelink.dev", "Blood Bank Operator Demo", Role.BLOOD_BANK_OPERATOR, None, blood_bank.blood_bank_id),
            ("usr_admin_1", "admin@lifelink.dev", "Admin Demo", Role.ADMIN, None, None),
        ]
        for uid, email, name, role, hospital_id, bank_id in users:
            exists = (await session.execute(select(UserModel).where(UserModel.user_id == uid))).scalar_one_or_none()
            if exists is None:
                session.add(UserModel(
                    user_id=uid, email=email, password_hash=hash_password("password123"), name=name,
                    status="active", created_at=datetime.now(timezone.utc), role_id=roles[role].role_id,
                    hospital_id=hospital_id, blood_bank_id=bank_id,
                ))
        await session.commit()
    print("Seed complete. Demo password: password123")


if __name__ == "__main__":
    asyncio.run(main())
