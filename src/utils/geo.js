// Haversine formula  calculates real distance between two GPS coordinates
// works on a sphere (Earth), not a flat map
// par km
function haversineKm(point1, point2) {
  const R = 6371; // raduis par km

  const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
  const dLng = (point2.lng - point1.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * (Math.PI / 180)) *
    Math.cos(point2.lat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function flightTimeMinutes(distanceKm, speedKmh) {
  if (speedKmh <= 0) return Infinity;
  return (distanceKm / speedKmh) * 60;
}

// seeing if it capabale based on time and distance 
function canReachRoundTrip(drone, missionTarget) {
  const distanceToTarget = haversineKm(drone.homeBase, missionTarget);
  const roundTrip = distanceToTarget * 2; // there and back
  const effectiveRange = drone.maxRange * (drone.battery / 100);
  return roundTrip <= effectiveRange;
}

module.exports = { haversineKm, flightTimeMinutes, canReachRoundTrip };