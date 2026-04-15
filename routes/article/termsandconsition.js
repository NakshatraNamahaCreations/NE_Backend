const express = require("express");
const router = express.Router();
const {
  addTermsCondition,
  findUserTermsCondition,
  findVendorTermsCondition,
  updateTermsNCondition,
  deleteTerms,
} = require("../../controllers/article/termsandconsition");

router.post("/save-tnc", addTermsCondition);
router.get("/get-user-tnc", findUserTermsCondition);
router.get("/get-vendor-tnc", findVendorTermsCondition);
router.put("/update-tnc-byid/:id", updateTermsNCondition);
router.delete("/delete-tnc/:id", deleteTerms);

module.exports = router;
