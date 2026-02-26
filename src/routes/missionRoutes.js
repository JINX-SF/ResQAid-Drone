const router = require("express").Router();
const ctrl = require("../controllers/missionControllers");

router.post("/", ctrl.createMission);
router.get("/", ctrl.getMissions);
router.get("/:id", ctrl.getMission);
router.delete("/:id", ctrl.deleteMission);

router.patch("/:id/assign-drone", ctrl .assignDrone);
router.patch("/:id/assign-survivor" , ctrl.assignSurvivor);
router.patch("/:id/status", ctrl.updateMissionStatus);

module.exports = router;