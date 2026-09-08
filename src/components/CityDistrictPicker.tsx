"use client";

import { useEffect, useState } from "react";
import { fetchBostaZones, type BostaCity } from "@/lib/bosta/zones";

export type CityDistrictValue = {
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
};

type Props = {
  value: CityDistrictValue;
  onChange: (value: CityDistrictValue) => void;
  theme?: "light" | "dark";
};

/**
 * Bosta will not accept a free-text city — every delivery needs an exact
 * city name plus a districtId from their own list. This is that list,
 * fetched once from the static zoning file, city first, then its districts.
 */
export default function CityDistrictPicker({
  value,
  onChange,
  theme = "light",
}: Props) {
  const [zones, setZones] = useState<BostaCity[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchBostaZones()
      .then((z) => {
        if (!cancelled) setZones(z);
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const field = `km-field ${theme === "dark" ? "km-field-dark" : "km-field-light"} min-w-0`;
  const city = zones?.find((c) => c.id === value.cityId);
  const districts = city?.districts ?? [];

  if (error) {
    return (
      <p className="text-[13px] text-brass">
        Could not load delivery areas — {error}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <select
        value={value.cityId}
        onChange={(e) => {
          const next = zones?.find((c) => c.id === e.target.value);
          onChange({
            cityId: e.target.value,
            cityName: next?.name ?? "",
            districtId: "",
            districtName: "",
          });
        }}
        disabled={!zones}
        aria-label="City"
        className={field}
      >
        <option value="">{zones ? "City" : "Loading cities…"}</option>
        {zones?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={value.districtId}
        onChange={(e) => {
          const next = districts.find((d) => d.id === e.target.value);
          onChange({
            ...value,
            districtId: e.target.value,
            districtName: next?.name ?? "",
          });
        }}
        disabled={!value.cityId}
        aria-label="District"
        className={field}
      >
        <option value="">{value.cityId ? "District" : "Pick a city first"}</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
    </div>
  );
}
