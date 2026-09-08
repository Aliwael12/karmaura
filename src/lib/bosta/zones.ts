/**
 * Egypt's cities and districts, exactly as Bosta names and IDs them —
 * generated once from their published zoning sheet
 * (storage.googleapis.com/zoning-sheets/Zoning-dataset-EG.xlsx), filtered
 * to the 3,112 city/district pairs marked drop-off available.
 *
 * Bosta will not accept a free-text city: every delivery needs this exact
 * city name plus a districtId from their list. Client-safe — no
 * "server-only" here, since the checkout form needs it too.
 */

export type BostaDistrict = { id: string; name: string; nameAr: string };
export type BostaCity = {
  id: string;
  name: string;
  nameAr: string;
  districts: BostaDistrict[];
};

let cached: Promise<BostaCity[]> | null = null;

/** Fetches the static zoning file once per page load and caches it. */
export async function fetchBostaZones(): Promise<BostaCity[]> {
  if (!cached) {
    cached = fetch("/bosta/zones.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load the delivery zones (${res.status})`);
        return res.json() as Promise<BostaCity[]>;
      })
      .catch((err) => {
        cached = null; // let the next call try again
        throw err;
      });
  }
  return cached;
}
