const express = require("express");
const router = express.Router();

const {
  createRequest,
  getEmergencyRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  deleteRequest,
   getEmergencyRequestById,
   getMyRequests,
} = require("../controllers/emergencyRequestControllers");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createRequest);
router.get("/my-requests", protect, getMyRequests);
router.get("/:id", protect, getEmergencyRequestById);

router.get("/", protect, getEmergencyRequests);


router.get("/:id", protect, getRequestById);

router.patch("/:id/accept", protect, acceptRequest);

router.patch("/:id/reject", protect, rejectRequest);

router.delete("/:id", protect, deleteRequest);

router.put("/:id/accept", protect, acceptRequest);
router.put("/:id/reject", protect, rejectRequest);


module.exports = router;