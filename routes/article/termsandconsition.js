const express = require("express");
const router = express.Router();
const {
  addTermsCondition,
  findTermsCondition,
} = require("../../controllers/article/termsandconsition");

router.put("/save-tnc", addTermsCondition);
router.get("/get-all-tnc", findTermsCondition);

module.exports = router;
