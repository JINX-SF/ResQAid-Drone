const router = require("express").Router();
const ctrl = require("../controllers/survivorControllers");

router.post("/", ctrl.createSurvivor);
router.get("/", ctrl.getSurvivors);
router.get("/:id", ctrl.getSurvivor);
router.put("/:id", ctrl.updateSurvivor);
router.delete("/:id", ctrl.deleteSurvivor);

module.exports = router;