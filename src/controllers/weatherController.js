const { getWeatherAt } = require("../services/weatherService");
const { isFlyable } = require("../utils/weather");

exports.getWeather = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const weather = await getWeatherAt(
      Number(lat),
      Number(lng)
    );

    res.json({
      windSpeed: weather.windSpeed,
      rainMm: weather.rainMm,
      visibility: weather.visibility,
      temperature: weather.temperature,
      condition: weather.condition || "Clear",
      isFlyable: isFlyable(weather),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};