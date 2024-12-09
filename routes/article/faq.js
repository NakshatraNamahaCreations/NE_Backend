const express = require("express");
const router = express.Router();
const {
  addFaq,
  getAllFaq,
  updateFaq,
  deleteFaq,
  updateFaqStatus,
} = require("../../controllers/article/faq");

router.post("/add-faq", addFaq);
router.get("/get-all-faq", getAllFaq);
router.put("/update-faq/:id", updateFaq);
router.delete("/delete-faq/:id", deleteFaq);
router.put("/update-faq-status/:id", updateFaqStatus);

module.exports = router;
