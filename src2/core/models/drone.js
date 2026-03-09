class Drone {
  constructor(data) {
    this.id = data.id || data._id;
    this.speed = data.speed || 0;
    this.battery = data.battery;
    this.maxRange = data.maxRange || 0;
    this.payloadCapacity = data.payloadCapacity || 0;
    this.status = data.status || "idle";

    this.position = {
      lat: data.position?.lat || data.location?.lat || 0,
      lng: data.position?.lng || data.location?.lng || 0,
      alt: data.position?.alt || 0,
    };
  }

  assignMission(mission) {
    if (mission.payloadWeight > this.payloadCapacity) {
      throw new Error("Payload exceeds capacity");
    }

    this.currentMission = mission;
    this.status = "in_mission";
  }

  startMission() {
    if (!this.currentMission) return;
    this.status = "in_mission";
  }

  updatePosition(newPosition) {
    this.position = newPosition;
  }

  consumeBattery(amount) {
    this.battery -= amount;
    if (this.battery <= 10) {
      this.battery = 0;
      this.status = "maintenance";
    }
  }

  completeMission() {
    this.currentMission = null;
    this.status = "idle";
  }
}

module.exports = Drone;
