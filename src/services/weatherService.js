const axios = require("axios");

async function getWeatherAt(lat, lng) {
  const key = process.env.OPENWEATHER_API_KEY;

  // if no API key configured, return safe default so app still works
  if (!key) {
    console.warn("⚠️ No OPENWEATHER_API_KEY set, using default weather");
    return {
      windSpeed: 0,
      windDir: 0,
      rainMm: 0,
      visibility: 10,
      temperature: 20,
      condition: "Clear",
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}&units=metric`;
  const res = await axios.get(url);
  const d = res.data;

  return {
    windSpeed:   (d.wind?.speed  || 0) * 3.6,      // convert m/s to km/h
    windDir:      d.wind?.deg    || 0,
    rainMm:       d.rain?.["1h"] || 0,
    visibility:  (d.visibility   || 10000) / 1000,  // convert meters to km
    temperature:  d.main?.temp   || 20,
    condition:    d.weather[0]?.main || "Clear",
  };
}

module.exports = { getWeatherAt };