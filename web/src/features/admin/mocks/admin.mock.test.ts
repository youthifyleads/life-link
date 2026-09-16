import { beforeEach, describe, expect, it } from "vitest";
import {
  createAdminBloodBank,
  createAdminHospital,
  createAdminUser,
  getAdminAuditLogs,
  getAdminBloodBanks,
  getAdminHospitals,
  getAdminKPIs,
  getAdminRoles,
  getAdminUsers,
  getPermissionMatrix,
  resetAdminMock,
  toggleHospitalStatus,
  toggleUserStatus,
  updateAdminHospital,
  updateAdminUser,
  updateRolePermissions,
} from "@/features/admin/mocks/admin.mock";

describe("Admin Mock Governance Repository", () => {
  beforeEach(() => {
    resetAdminMock();
  });

  it("calculates governance KPIs accurately", async () => {
    const kpis = await getAdminKPIs();
    expect(kpis.totalUsers).toBeGreaterThanOrEqual(9);
    expect(kpis.activeUsers).toBeGreaterThanOrEqual(8);
    expect(kpis.totalHospitals).toBeGreaterThanOrEqual(6);
    expect(kpis.totalBloodBanks).toBeGreaterThanOrEqual(4);
    expect(kpis.activeBloodRequests).toBeGreaterThanOrEqual(4);
    expect(kpis.recentAdminChanges).toBeGreaterThanOrEqual(7);
  });

  it("creates a new user and appends an audit log event", async () => {
    const initialLogs = await getAdminAuditLogs();
    const newUser = await createAdminUser({
      fullName: "Dr. Laila Samir",
      email: "laila.samir@cairohospital.test",
      primaryRole: "hospital_staff",
      organizationId: "hospital-cairo-general",
      status: "active",
      phone: "+20 10 9999 0000",
    });

    expect(newUser.id).toMatch(/^USR-\d+/);
    expect(newUser.fullName).toBe("Dr. Laila Samir");
    expect(newUser.organizationName).toBe("Cairo General Hospital");

    const users = await getAdminUsers({ search: "Laila" });
    expect(users).toHaveLength(1);
    expect(users[0].id).toBe(newUser.id);

    const updatedLogs = await getAdminAuditLogs();
    expect(updatedLogs.length).toBe(initialLogs.length + 1);
    expect(updatedLogs[0].action).toBe("User account provisioned");
    expect(updatedLogs[0].entityId).toBe(newUser.id);
  });

  it("updates and toggles user status", async () => {
    const user = await updateAdminUser("USR-002", {
      phone: "+20 10 7777 8888",
    });
    expect(user.phone).toBe("+20 10 7777 8888");

    const toggled = await toggleUserStatus("USR-002");
    expect(toggled.status).toBe("inactive");

    const restored = await toggleUserStatus("USR-002");
    expect(restored.status).toBe("active");
  });

  it("creates and toggles hospital status", async () => {
    const hospital = await createAdminHospital({
      name: "Assiut University Medical Center",
      facilityCode: "AUMC-088",
      governorate: "Assiut",
      address: "University City, Assiut",
      phone: "+20 88 2413 000",
      status: "active",
    });

    expect(hospital.name).toBe("Assiut University Medical Center");
    expect(hospital.facilityCode).toBe("AUMC-088");

    const updated = await updateAdminHospital(hospital.id, {
      phone: "+20 88 9999 111",
    });
    expect(updated.phone).toBe("+20 88 9999 111");

    const hospitalsList = await getAdminHospitals({ search: "Assiut" });
    expect(hospitalsList).toHaveLength(1);

    const toggled = await toggleHospitalStatus(hospital.id);
    expect(toggled.status).toBe("inactive");

    const logs = await getAdminAuditLogs({ action: "Hospital facility deactivated" });
    expect(logs).toHaveLength(1);
    expect(logs[0].entityId).toBe(hospital.id);
  });

  it("synchronizes blood bank inventory live count from shared inventory store", async () => {
    const bloodBanks = await getAdminBloodBanks();
    const central = bloodBanks.find((b) => b.id === "central-blood-bank");
    expect(central).toBeDefined();
    expect(central?.inventorySummary.totalAvailable).toBeGreaterThan(0);
  });

  it("creates a new blood bank facility", async () => {
    const newBank = await createAdminBloodBank({
      name: "Luxor Regional Blood Center",
      facilityCode: "LRC-009",
      governorate: "Luxor",
      address: "Karnak Temple St, Luxor",
      phone: "+20 95 2271 400",
      status: "active",
    });

    expect(newBank.facilityCode).toBe("LRC-009");
    const banks = await getAdminBloodBanks({ search: "Luxor" });
    expect(banks).toHaveLength(1);
  });

  it("updates role permissions and records audit trail", async () => {
    const { rolePermissions } = await getPermissionMatrix();
    const currentLeadPerms = rolePermissions.medical_lead;
    const newLeadPerms = [...currentLeadPerms, "req.create"];

    const updated = await updateRolePermissions("medical_lead", newLeadPerms);
    expect(updated.medical_lead).toContain("req.create");

    const logs = await getAdminAuditLogs();
    expect(logs[0].action).toBe("Role permissions matrix updated");
    expect(logs[0].entityId).toBe("role-medical_lead");
  });

  it("returns roles including future healthcare roles", async () => {
    const roles = await getAdminRoles();
    const codes = roles.map((r) => r.code);
    expect(codes).toContain("admin");
    expect(codes).toContain("hospital_staff");
    expect(codes).toContain("blood_bank_staff");
    expect(codes).toContain("medical_lead");
    expect(codes).toContain("platform_support");
    expect(codes).toContain("donor");
    expect(codes).toContain("caregiver");
  });
});
