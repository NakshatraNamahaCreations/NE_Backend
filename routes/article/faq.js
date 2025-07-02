const express = require("express");
const router = express.Router();
const {
  addFaq,
  getAllFaq,
  getAllUserFAQ,
  getAllVendorFAQ,
  updateFaq,
  deleteFaq,
  updateFaqStatus,
} = require("../../controllers/article/faq");

router.post("/add-faq", addFaq);
router.get("/get-all-faq", getAllFaq);
router.get("/get-user-faq", getAllUserFAQ);
router.get("/get-vendor-faq", getAllVendorFAQ);
router.put("/update-faq/:id", updateFaq);
router.delete("/delete-faq/:id", deleteFaq);
router.put("/update-faq-status/:id", updateFaqStatus);

module.exports = router;
