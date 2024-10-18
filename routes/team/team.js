const express = require("express");
const router = express.Router();
const {
  createTeam,
  getTeam,
  blockMember,
  getUser,
  unblockMember,
  updateUser,
} = require("../../controllers/team/team");

router.post("/create-team", createTeam);
router.get("/get-all-member", getTeam);
router.get("/get-user/:id", getUser);
router.put("/block-user/:id", blockMember);
router.put("/unblock-user/:id", unblockMember);
router.put("/update-user/:id", updateUser);

module.exports = router;
