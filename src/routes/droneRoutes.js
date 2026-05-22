const router = require("express").Router();
const ctrl = require("../controllers/droneControllers");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const express = require("express");

const {
  getDrones,
  getDrone,
  createDrone,
  updateDrone,
  getDroneHistory,
  disableDrone,
  reactivateDrone,
  getDisabledDrones,

} = require("../controllers/droneControllers");

router.get("/disabled", protect,adminOnly, getDisabledDrones);
router.patch("/:id/disable", protect,adminOnly, disableDrone);
router.patch("/:id/reactivate", protect,adminOnly, reactivateDrone);

router.post("/", protect,adminOnly, ctrl.createDrone);
router.get("/", protect,adminOnly, ctrl.getDrones);
router.get("/:id", protect,adminOnly, ctrl.getDrone);
router.put("/:id", protect,adminOnly, ctrl.updateDrone);
router.delete("/:id", protect,adminOnly, restrictTo("admin"), ctrl.deleteDrone);


router.post("/:id/goto",           protect,adminOnly, ctrl.gotoLocation);
router.post("/:id/return-home",    protect,adminOnly, ctrl.returnHome);
router.post("/:id/emergency-stop", protect,adminOnly, ctrl.emergencyStop);

router.get("/:id/history", protect, getDroneHistory);


module.exports = router;