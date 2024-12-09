const express = require("express");
const router = express.Router();
const {
  addTermsCondition,
  findTermsCondition,
} = require("../../controllers/article/termsandconsitionUser");

router.put("/add-tnc-user", addTermsCondition);
router.get("/get-all-tnc-user", findTermsCondition);

module.exports = router;
