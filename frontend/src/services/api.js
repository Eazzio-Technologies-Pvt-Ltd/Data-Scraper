import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL;

export const searchBusinesses = async (keyword, location) => {
  const res = await axios.get(`${BASE}/api/search`, {
    params: { keyword, location },
  });
  return res.data;
};

export const exportCSV = async (keyword, location, cities = [], types = []) => {
  const params = new URLSearchParams({ keyword, location });
  if (cities.length) params.append("cities", cities.join(","));
  if (types.length)  params.append("types",  types.join(","));
  const res = await axios.get(`${BASE}/api/export?${params.toString()}`, {
    responseType: "blob",
  });
  const today    = new Date().toISOString().split("T")[0];
  const filename = `${keyword}_${location}_${today}.csv`.toLowerCase().replace(/\s/g,"_");
  const url      = window.URL.createObjectURL(new Blob([res.data]));
  const a        = document.createElement("a");
  a.href         = url;
  a.download     = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
