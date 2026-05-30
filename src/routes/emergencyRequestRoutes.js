const express = require("express");
const router = express.Router();

const {
  createRequest,
  getEmergencyRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  deleteRequest,
  getMyRequests,
  getMissionIntelligence,
  updateStatus,          
} = require("../controllers/emergencyRequestControllers");

const { protect } = require("../middleware/authMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/",             protect, createRequest);
router.get("/my-requests",   protect, getMyRequests);
router.get("/",              protect, getEmergencyRequests);

// NOTE: specific sub-routes (intelligence, accept, reject, status)
// must come BEFORE the generic /:id route, otherwise Express
// matches "intelligence" as the :id parameter.
router.get("/:id/intelligence", protect, getMissionIntelligence);
router.patch("/:id/accept",     protect, acceptRequest);
router.patch("/:id/reject",     protect, rejectRequest);
router.patch("/:id/status",     protect, updateStatus);   

router.get("/:id",   protect, getRequestById);
router.delete("/:id", protect, deleteRequest);


router.put("/:id/accept", protect, acceptRequest);
router.put("/:id/reject", protect, rejectRequest);


module.exports = router;