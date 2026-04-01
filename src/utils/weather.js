// Takes a weather object and returns risk information
// weather object comes from weatherService.js

function getRiskScore(weather) {
  let score = 0;

  if (weather.windSpeed > 30) score += 2;
  if (weather.windSpeed > 45) score += 1;
  if (weather.rainMm > 5)     score += 2;
  if (weather.visibility < 3) score += 3;

  return score; // 0 = perfect, 7 = extremely dangerous
}

function isFlyable(weather) {
  return (
    weather.windSpeed  < 50 &&
    weather.rainMm     < 10 &&
    weather.visibility > 1
  );
}

function getConditionLabel(weather) {
  const score = getRiskScore(weather);
  if (score === 0) return "Perfect";
  if (score <= 2)  return "Good";
  if (score <= 4)  return "Moderate";
  return "Dangerous";
}

module.exports = { getRiskScore, isFlyable, getConditionLabel };