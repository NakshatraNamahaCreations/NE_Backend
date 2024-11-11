const express = require("express");
const router = express.Router();
const {
  addFaq,
  getAllFaq,
  updateFaq,
  deleteFaq,
} = require("../../controllers/article/faq");

router.post("/add-faq", addFaq);
router.get("/get-all-faq", getAllFaq);
router.put("/update-faq/:id", updateFaq);
router.delete("/delete-faq/:id", deleteFaq);

module.exports = router;
