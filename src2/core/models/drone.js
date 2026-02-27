class drone {
  constructor(data) {
    this.id = data.id;
    this.speed = data.speed; 
    this.battery = data.battery; 
    this.maxRange = data.maxRange; 
    this.payloadCapacity = data.payloadCapacity; 
    this.status = data.status; 
  this.position = {
  lat: data.position?.lat || 0,
  lng: data.position?.lng || 0,
  alt: data.position?.alt || 0
};
  }
  assignMission(mission) {
    if (mission.payloadWeight > this.payloadCapacity) {
      throw new Error("Payload exceeds capacity");
    }

    this.currentMission = mission;
    this.status = "assigned";
  }

  startMission() {
    if (!this.currentMission) return;
    this.status = "in_progress";
  }

  updatePosition(newPosition) {
    this.position = newPosition;
  }

  consumeBattery(amount) {
    this.battery -= amount;
    if (this.battery <= 10) {
      this.battery = 0;
      this.status = "offline";
    }
  }

  completeMission() {
    this.currentMission = null;
    this.status = "available";
  }
}

module.exports = drone;
