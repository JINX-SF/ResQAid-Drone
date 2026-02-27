class mission {
  constructor(data) {
    if (!data.start || !data.destination) {
      throw new Error("Mission requires start and destination coordinates");
    }

    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.type = data.type; 
    this.start = data.start; 
    this.destination = data.destination; 
    this.payloadWeight = data.payloadWeight; 
    this.urgency = data.urgency || "Low";
    this.status = "pending";   
    this.cameras = data.cameras || []; 
    this.description = data.description || "";
    this.details = data.details || "";
    this.request = data.request || null;
    this.response = data.response || null;
  }

  describe() {
    const cameraInfo = this.cameras.length > 0 ? `with ${this.cameras.join(', ')} camera(s)` : "";
    return `${this.type} mission from (${this.start.x},${this.start.y},${this.start.z}) 
    to (${this.destination.x},${this.destination.y},${this.destination.z}),
     carrying ${this.payloadWeight}kg, urgency: ${this.urgency} ${cameraInfo}`;
  }

  addDescription(description, details) {
    this.description = description;
    this.details = details;
  }

  setRequest(requestData) {
    this.request = requestData;
    this.status = "pending";
  }

  setResponse(responseData) {
    this.response = responseData;
    this.status = "completed";
  }
  
  acceptMission() {
    this.status = "accepted";
  }

  startMission() {
    this.status = "in_progress";
  }

}

module.exports = mission;
