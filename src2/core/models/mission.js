class Mission {
  constructor(data) {
    this.id = data.id || data._id;
    this.type = data.type || "general";
    this.start = data.start || {
      x: 0,
      y: 0,
      z: 0,
    };
    this.destination = data.destination || {
      x: 0,
      y: 0,
      z: 0,
    };

    this.payloadWeight = data.payloadWeight || 0;
    this.urgency = data.urgency || "Low";
    this.status = data.status || "pending";
    this.cameras = data.cameras || [];
    this.description = data.description || "";
    this.details = data.details || "";
    this.request = data.request || null;
    this.response = data.response || null;
  }

  describe() {
    return `${this.type} mission, urgency: ${this.urgency}, status: ${this.status}`;
  }

  startMission() {
    this.status = "active";
  }

  completeMission() {
    this.status = "completed";
  }
}

module.exports = Mission;
