const router = require("express").Router();
const ctrl = require("../controllers/droneControllers");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/", protect, ctrl.createDrone);
router.get("/", protect, ctrl.getDrones);
router.get("/:id", protect, ctrl.getDrone);
router.put("/:id", protect, ctrl.updateDrone);
router.delete("/:id", protect, restrictTo("admin"), ctrl.deleteDrone);

module.exports = router;
router.post("/:id/goto",           protect, ctrl.gotoLocation);
router.post("/:id/return-home",    protect, ctrl.returnHome);
router.post("/:id/emergency-stop", protect, ctrl.emergencyStop);