export const obterEndereco = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("api key do google maps não configurada");
    return null;
  }

  try {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
  );
  const data = await res.json();

  if (data.status === "OK" && data.results[0]) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error("erro no geocoding:", error);
    return null;
  }
};