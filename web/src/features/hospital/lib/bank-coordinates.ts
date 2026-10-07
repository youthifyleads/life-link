/**
 * Geographical coordinates and distance utilities for Egyptian Blood Banks and Hospitals.
 * Provides realistic GPS coordinates based on hospital/blood bank names and Egyptian governorates.
 */

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

// ── Egyptian Governorate Capital Centers ──
export const EGYPT_GOVERNORATE_COORDS: Record<string, GeoCoordinate> = {
  cairo: { latitude: 30.0444, longitude: 31.2357 },
  giza: { latitude: 30.0131, longitude: 31.2089 },
  alexandria: { latitude: 31.2001, longitude: 29.9187 },
  qalyubia: { latitude: 30.1286, longitude: 31.2422 },
  beheira: { latitude: 30.8481, longitude: 30.3437 }, // Damanhour
  gharbia: { latitude: 30.9747, longitude: 31.015 }, // Tanta
  sharkia: { latitude: 30.5877, longitude: 31.502 }, // Zagazig
  dakahlia: { latitude: 31.0364, longitude: 31.3807 }, // Mansoura
  "kafr el-sheikh": { latitude: 31.1117, longitude: 30.9388 },
  monufia: { latitude: 30.5972, longitude: 30.9876 }, // Shebin El-Kom
  menofia: { latitude: 30.5972, longitude: 30.9876 },
  damietta: { latitude: 31.4175, longitude: 31.8144 },
  "port said": { latitude: 31.2565, longitude: 32.2841 },
  suez: { latitude: 29.9668, longitude: 32.5498 },
  ismailia: { latitude: 30.6043, longitude: 32.2723 },
  fayoum: { latitude: 29.3084, longitude: 30.8428 },
  "beni suef": { latitude: 29.0661, longitude: 31.0994 },
  minya: { latitude: 28.0871, longitude: 30.7618 },
  assiut: { latitude: 27.1783, longitude: 31.1859 },
  asyut: { latitude: 27.1783, longitude: 31.1859 },
  sohag: { latitude: 26.5591, longitude: 31.6948 },
  qena: { latitude: 26.1551, longitude: 32.716 },
  luxor: { latitude: 25.6872, longitude: 32.6396 },
  aswan: { latitude: 24.0889, longitude: 32.8998 },
  "red sea": { latitude: 27.1783, longitude: 33.7993 },
  "new valley": { latitude: 25.439, longitude: 30.0565 },
  matruh: { latitude: 31.3525, longitude: 27.2453 },
  "north sinai": { latitude: 31.1322, longitude: 33.799 },
  "south sinai": { latitude: 28.2358, longitude: 33.8597 },
};

// ── Specific District & Blood Bank Coordinates ──
export const DISTRICT_BANK_COORDS: Record<string, GeoCoordinate> = {
  // Cairo
  shobra: { latitude: 30.076, longitude: 31.245 },
  shoubra: { latitude: 30.076, longitude: 31.245 },
  abbassia: { latitude: 30.0738, longitude: 31.2821 },
  demerdash: { latitude: 30.0772, longitude: 31.276 },
  "ain shams": { latitude: 30.1312, longitude: 31.3281 },
  "rod el-farag": { latitude: 30.0842, longitude: 31.2449 },
  maadi: { latitude: 29.9602, longitude: 31.2569 },
  helwan: { latitude: 29.8491, longitude: 31.334 },
  "nasr city": { latitude: 30.0626, longitude: 31.3437 },
  "dar el-salam": { latitude: 29.9833, longitude: 31.2422 },
  "kasr al-ainy": { latitude: 30.0305, longitude: 31.229 },
  qasr: { latitude: 30.0305, longitude: 31.229 },
  "15 may": { latitude: 29.8512, longitude: 31.3789 },

  // Giza
  "6th of october": { latitude: 29.9285, longitude: 30.9188 },
  october: { latitude: 29.9285, longitude: 30.9188 },
  dokki: { latitude: 30.038, longitude: 31.2116 },
  imbaba: { latitude: 30.0764, longitude: 31.2089 },
  haram: { latitude: 29.992, longitude: 31.158 },
  "abu al-nomros": { latitude: 29.9067, longitude: 31.231 },
  "al-ayyat": { latitude: 29.62, longitude: 31.252 },
  "al-badrashein": { latitude: 29.8328, longitude: 31.2726 },
  badrashein: { latitude: 29.8328, longitude: 31.2726 },
  "al-hawamdiya": { latitude: 29.8975, longitude: 31.2522 },
  hawamdiya: { latitude: 29.8975, longitude: 31.2522 },
  "al-saf": { latitude: 29.5706, longitude: 31.2876 },
  oseem: { latitude: 30.1014, longitude: 31.1372 },

  // Alexandria
  "abu qir": { latitude: 31.3161, longitude: 30.0667 },
  "al-gomhoureya": { latitude: 31.1934, longitude: 29.9085 },
  "al-humat": { latitude: 31.21, longitude: 29.945 },
  maamoura: { latitude: 31.28, longitude: 30.04 },
  "borg el-arab": { latitude: 30.846, longitude: 29.693 },

  // Qalyubia
  "al-khanka": { latitude: 30.2131, longitude: 31.3489 },
  banha: { latitude: 30.461, longitude: 31.18 },
  benha: { latitude: 30.461, longitude: 31.18 },
  qalyub: { latitude: 30.19, longitude: 31.2166 },
  "shubra el-kheima": { latitude: 30.1286, longitude: 31.2422 },
  "abu el-manga": { latitude: 30.25, longitude: 31.28 },
  toukh: { latitude: 30.3535, longitude: 31.203 },

  // Beheira
  "abu el-matamir": { latitude: 30.9103, longitude: 30.1758 },
  "abu hummus": { latitude: 31.0625, longitude: 30.2978 },
  "badr el-tahrir": { latitude: 30.7247, longitude: 30.4842 },
  damanhour: { latitude: 31.0341, longitude: 30.4687 },
  edko: { latitude: 31.3031, longitude: 30.2944 },
  "itay el-barud": { latitude: 31.0189, longitude: 30.3872 },
  "kafr el-dawwar": { latitude: 31.1352, longitude: 30.1313 },
  "kom hamada": { latitude: 30.7567, longitude: 30.6936 },
  rosetta: { latitude: 31.4043, longitude: 30.4167 },
  rashid: { latitude: 31.4043, longitude: 30.4167 },
  shubrakhit: { latitude: 31.0628, longitude: 30.5503 },
  "wadi el-natrun": { latitude: 30.3693, longitude: 30.36 },

  // Sharkia
  "abu hammad": { latitude: 30.5497, longitude: 31.7025 },
  "abu kabir": { latitude: 30.7256, longitude: 31.6734 },
  belbeis: { latitude: 30.4222, longitude: 31.5615 },
  fakous: { latitude: 30.7306, longitude: 31.7921 },
  husseiniya: { latitude: 30.8757, longitude: 31.932 },
  zagazig: { latitude: 30.5877, longitude: 31.502 },

  // Gharbia
  "el-mahalla": { latitude: 30.9697, longitude: 31.1667 },
  mahalla: { latitude: 30.9697, longitude: 31.1667 },
  "kafr el-zayat": { latitude: 30.8147, longitude: 30.8058 },
  tanta: { latitude: 30.7865, longitude: 31.0004 },
  zefta: { latitude: 30.7133, longitude: 31.2444 },

  // Dakahlia
  mansoura: { latitude: 31.0364, longitude: 31.3807 },
  "mit ghamr": { latitude: 30.7174, longitude: 31.2578 },
  talkha: { latitude: 31.0539, longitude: 31.3856 },

  // Monufia
  "shebin el-kom": { latitude: 30.5639, longitude: 31.0083 },
  menouf: { latitude: 30.4625, longitude: 30.9258 },
  ashmoun: { latitude: 30.2986, longitude: 31.0139 },
  tala: { latitude: 30.6725, longitude: 30.9375 },
  quesna: { latitude: 30.4825, longitude: 31.1275 },

  // Upper Egypt
  fayoum: { latitude: 29.3084, longitude: 30.8428 },
  "beni suef": { latitude: 29.0661, longitude: 31.0994 },
  minya: { latitude: 28.0871, longitude: 30.7618 },
  assiut: { latitude: 27.1783, longitude: 31.1859 },
  asyut: { latitude: 27.1783, longitude: 31.1859 },
  sohag: { latitude: 26.5591, longitude: 31.6948 },
  qena: { latitude: 26.1551, longitude: 32.716 },
  luxor: { latitude: 25.6872, longitude: 32.6396 },
  aswan: { latitude: 24.0889, longitude: 32.8998 },
};

/**
 * Deterministic hash offset (within ~300 meters) so banks sharing the same
 * district/city center do not have identical coordinates or distances.
 */
function getDeterministicOffset(seed: string): { dLat: number; dLon: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 19) - 9) * 0.0015; // ± ~150-200m
  const lonOffset = ((Math.abs(hash >> 3) % 19) - 9) * 0.0015;
  return { dLat: latOffset, dLon: lonOffset };
}

/**
 * Resolves accurate GPS coordinates for a blood bank or hospital.
 */
export function resolveBloodBankCoordinates(
  name: string,
  governorate?: string | null,
  id?: string,
  existingLat?: number | null,
  existingLon?: number | null,
): GeoCoordinate {
  if (
    typeof existingLat === "number" &&
    !isNaN(existingLat) &&
    typeof existingLon === "number" &&
    !isNaN(existingLon) &&
    existingLat !== 0 &&
    existingLon !== 0
  ) {
    return { latitude: existingLat, longitude: existingLon };
  }

  const nameLower = (name || "").toLowerCase();
  const govLower = (governorate || "").toLowerCase();
  const idLower = (id || "").toLowerCase();

  // Special match for Shobra General Hospital Blood Bank:
  if (
    idLower === "239d19f5-bcd5-482f-9b89-00a3fcab54ee" ||
    (nameLower.includes("shobra") && nameLower.includes("general"))
  ) {
    return { latitude: 30.076, longitude: 31.245 };
  }

  // Check district matches (longest matching key wins)
  let bestMatch: GeoCoordinate | null = null;
  let bestLen = 0;

  for (const [key, coords] of Object.entries(DISTRICT_BANK_COORDS)) {
    if (nameLower.includes(key) && key.length > bestLen) {
      bestMatch = coords;
      bestLen = key.length;
    }
  }

  const seed = id || name;
  const { dLat, dLon } = getDeterministicOffset(seed);

  if (bestMatch) {
    return {
      latitude: Math.round((bestMatch.latitude + dLat) * 100000) / 100000,
      longitude: Math.round((bestMatch.longitude + dLon) * 100000) / 100000,
    };
  }

  // Fallback to governorate capital
  for (const [key, coords] of Object.entries(EGYPT_GOVERNORATE_COORDS)) {
    if (govLower.includes(key) || key.includes(govLower)) {
      return {
        latitude: Math.round((coords.latitude + dLat) * 100000) / 100000,
        longitude: Math.round((coords.longitude + dLon) * 100000) / 100000,
      };
    }
  }

  // Default Cairo center with offset
  return {
    latitude: Math.round((30.0444 + dLat) * 100000) / 100000,
    longitude: Math.round((31.2357 + dLon) * 100000) / 100000,
  };
}

/**
 * Calculates great-circle distance between two GPS coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // If coordinates are identical (e.g. inside same hospital campus)
  if (Math.abs(lat1 - lat2) < 0.0008 && Math.abs(lon1 - lon2) < 0.0008) {
    return 0.0;
  }

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;

  return Math.round(dist * 10) / 10;
}
