const express = require("express");
const router = express.Router();
const {
  addState,
  getAllStates,
  getStatesById,
  deleteState,
  activeStatus,
  inActiveStatus,
  getActiveStates,
} = require("../../controllers/master/state");

router.post("/add-state", addState);
router.get("/get-all-states", getAllStates);
router.get("/get-active-states", getActiveStates);
router.get("/get-states-by-id/:id", getStatesById);
router.delete("/delete-state/:id", deleteState);
router.put("/active-status/:id", activeStatus);
router.put("/inactive-status/:id", inActiveStatus);

module.exports = router;
