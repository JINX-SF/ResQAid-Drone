const router = require("express").Router();
const ctrl = require("../controllers/missionControllers");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getMissions,
  getMission,
  createMission,
  updateMission,
  deleteMission,
  disableMission,
  reactivateMission,
  getDisabledMissions,
  getMissionHistory,
  getMissionIntelligence,
  activateMission,
  completeMission,
} = require("../controllers/missionControllers");

router.get("/disabled", getDisabledMissions);
router.get("/:id/intelligence", getMissionIntelligence);

router.patch("/:id/disable", disableMission);
router.patch("/:id/reactivate", reactivateMission);

// NEW: auto-activate (assigned → active + drone → in_mission)
router.patch("/:id/activate", protect, adminOnly, activateMission);

// Resume Mission button (active → completed + drone → idle)
router.patch("/:id/complete", protect, adminOnly, completeMission);

router.post("/", protect, adminOnly, ctrl.createMission);
router.get("/", protect, adminOnly, ctrl.getMissions);
router.get("/:id", protect, adminOnly, ctrl.getMission);
router.delete("/:id", protect, restrictTo("admin"), ctrl.deleteMission);

router.patch("/:id/assign-drone", protect, adminOnly, ctrl.assignDrone);
router.patch("/:id/assign-survivor", protect, adminOnly, ctrl.assignSurvivor);
router.patch("/:id/status", protect, adminOnly, ctrl.updateMissionStatus);
router.put("/:id", protect, adminOnly, ctrl.updateMission);

router.get("/:id/history", protect, getMissionHistory);

module.exports = router;