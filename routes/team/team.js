const express = require("express");
const router = express.Router();
const {
  createTeam,
  getTeam,
  blockMember,
  getUser,
  unblockMember,
  updateUser,
  teamUserLogin,
  deleteTeamUser,
  logout,
} = require("../../controllers/team/team");

router.post("/create-team", createTeam);
router.get("/get-all-member", getTeam);
router.get("/get-user/:id", getUser);
router.post("/team-user-login", teamUserLogin);
router.put("/block-user/:id", blockMember);
router.put("/unblock-user/:id", unblockMember);
router.put("/update-user/:id", updateUser);
router.delete("/delete-team-user/:id", deleteTeamUser);
router.post("/logout-user/:id", logout);

module.exports = router;
