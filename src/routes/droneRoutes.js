const router = require("express").Router();
const ctrl = require("../controllers/droneControllers");

router.post("/", ctrl.createDrone);
router.get("/", ctrl.getDrones);
router.get("/:id", ctrl.getDrone);
router.put("/:id", ctrl.updateDrone);
router.delete("/:id", ctrl.deleteDrone);

module.exports = router;