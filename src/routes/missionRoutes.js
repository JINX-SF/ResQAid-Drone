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

} = require("../controllers/missionControllers");

router.get("/disabled", getDisabledMissions);

router.patch("/:id/disable", disableMission);

router.patch("/:id/reactivate", reactivateMission);

router.post("/", protect,adminOnly, ctrl.createMission);
router.get("/", protect,adminOnly, ctrl.getMissions);
router.get("/:id", protect,adminOnly, ctrl.getMission);
router.delete("/:id", protect, restrictTo("admin"), ctrl.deleteMission);

router.patch("/:id/assign-drone", protect,adminOnly, ctrl.assignDrone);
router.patch("/:id/assign-survivor", protect,adminOnly, ctrl.assignSurvivor);
router.patch("/:id/status", protect,adminOnly, ctrl.updateMissionStatus);
router.put("/:id", protect,adminOnly, ctrl.updateMission);

router.get("/:id/history",protect,getMissionHistory);

module.exports = router;