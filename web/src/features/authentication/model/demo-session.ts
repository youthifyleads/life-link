import type {
  AuthenticatedUser,
  UserRole,
} from "@/features/authentication/model/auth.types";

const demoSessionKey = "blood-bank:development-demo-session";

export const isDemoAuthenticationEnabled = import.meta.env.DEV;

function assertDevelopmentMode() {
  if (!isDemoAuthenticationEnabled) {
    throw new Error("Demo authentication is available in development only.");
  }
}

export type DemoSessionRole = Extract<
  UserRole,
  "hospital_staff" | "blood_bank_staff" | "admin" | "donor" | "caregiver"
>;

function createHospitalDemoUser(): AuthenticatedUser {
  return {
    id: "demo-hospital-user",
    email: "ahmed.hospital@example.test",
    display_name: "Ahmed Hospital User",
    primary_role: "hospital_staff",
    roles: ["hospital_staff"],
    active_organization_id: "demo-hospital",
    organizations: [
      {
        id: "demo-hospital",
        name: "Demo Hospital",
        type: "hospital",
      },
    ],
    permissions: [
      "hospital.requests.view",
      "hospital.requests.create",
      "hospital.requests.cancel",
      "hospital.documents.upload",
    ],
  };
}

function createBloodBankDemoUser(): AuthenticatedUser {
  return {
    id: "demo-blood-bank-user",
    email: "mariam.bloodbank@example.test",
    display_name: "Mariam Blood Bank User",
    primary_role: "blood_bank_staff",
    roles: ["blood_bank_staff"],
    active_organization_id: "central-blood-bank",
    organizations: [
      {
        id: "central-blood-bank",
        name: "Central Blood Bank",
        type: "blood_bank",
      },
    ],
    permissions: [
      "blood_bank.requests.view",
      "blood_bank.requests.acknowledge",
      "blood_bank.requests.confirm",
      "blood_bank.requests.prepare",
      "blood_bank.requests.complete",
      "blood_bank.requests.reject",
    ],
  };
}

function createAdminDemoUser(): AuthenticatedUser {
  return {
    id: "demo-admin-user",
    email: "nour.admin@example.test",
    display_name: "Nour System Admin",
    primary_role: "admin",
    roles: ["admin"],
    active_organization_id: "platform-administration",
    organizations: [
      {
        id: "platform-administration",
        name: "Blood Bank Platform Administration",
        type: "platform",
      },
    ],
    permissions: [
      "admin.users.view",
      "admin.users.manage",
      "admin.organizations.manage",
      "admin.roles.manage",
      "admin.permissions.manage",
      "admin.audit.view",
    ],
  };
}

function createDonorDemoUser(): AuthenticatedUser {
  return {
    id: "demo-donor-user",
    email: "omar.donor@example.test",
    display_name: "Omar Donor",
    primary_role: "donor",
    roles: ["donor"],
    active_organization_id: "donor-portal",
    organizations: [
      {
        id: "donor-portal",
        name: "Donor Portal",
        type: "platform",
      },
    ],
    permissions: [
      "donor.profile.view",
      "donor.requests.view",
      "donor.requests.respond",
      "donor.donations.view",
      "donor.vouchers.view",
      "donor.notifications.view",
    ],
  };
}

function createCaregiverDemoUser(): AuthenticatedUser {
  return {
    id: "demo-caregiver-user",
    email: "sara.caregiver@example.test",
    display_name: "Sara Caregiver",
    primary_role: "caregiver",
    roles: ["caregiver"],
    active_organization_id: "caregiver-tracking",
    organizations: [
      {
        id: "caregiver-tracking",
        name: "Caregiver Tracking",
        type: "platform",
      },
    ],
    permissions: [
      "caregiver.dashboard.view",
      "caregiver.tracking.view",
      "caregiver.scan.use",
    ],
  };
}

function createDemoUser(role: DemoSessionRole): AuthenticatedUser {
  switch (role) {
    case "admin":
      return createAdminDemoUser();
    case "blood_bank_staff":
      return createBloodBankDemoUser();
    case "donor":
      return createDonorDemoUser();
    case "caregiver":
      return createCaregiverDemoUser();
    case "hospital_staff":
    default:
      return createHospitalDemoUser();
  }
}

export function startDemoSession(role: DemoSessionRole = "hospital_staff") {
  assertDevelopmentMode();
  window.sessionStorage.setItem(demoSessionKey, role);
  return createDemoUser(role);
}

export function restoreDemoSession() {
  assertDevelopmentMode();
  const storedRole = window.sessionStorage.getItem(demoSessionKey);

  if (storedRole === "admin") {
    return createDemoUser("admin");
  }

  if (storedRole === "blood_bank_staff") {
    return createDemoUser("blood_bank_staff");
  }

  if (storedRole === "donor") {
    return createDemoUser("donor");
  }

  if (storedRole === "caregiver") {
    return createDemoUser("caregiver");
  }

  if (storedRole === "hospital_staff" || storedRole === "active") {
    return createDemoUser("hospital_staff");
  }

  return null;
}

export function clearDemoSession() {
  if (isDemoAuthenticationEnabled) {
    window.sessionStorage.removeItem(demoSessionKey);
  }
}
