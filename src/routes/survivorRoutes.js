const router = require("express").Router();
const ctrl = require("../controllers/survivorControllers");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/",protect, ctrl.createSurvivor);
router.get("/",protect, ctrl.getSurvivors);
router.get("/:id",protect, ctrl.getSurvivor);
router.put("/:id",protect, ctrl.updateSurvivor);
router.delete("/:id",protect,restrictTo("admin"), ctrl.deleteSurvivor);

module.exports = router;