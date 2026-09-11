import { i18n } from "@/app/i18n/i18n";

export const egyptGovernorates = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Gharbia",
  "Dakahlia",
  "Assiut",
  "Suez",
  "Luxor",
  "Aswan",
] as const;

export function getGovernorateLabel(governorate: string) {
  return i18n.t(`admin.governorates.${governorate}`, governorate);
}
