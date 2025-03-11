const express = require("express");
const router = express.Router();
const { postEnquiry } = require("../../controllers/vendor/service-enquiry");

router.post("/post-enquiry", postEnquiry);

module.exports = router;
