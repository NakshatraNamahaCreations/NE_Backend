const express = require("express");
const router = express.Router();
const { downloadDoc } = require("../../controllers/download/download");

router.get("/download-doc", downloadDoc);

module.exports = router;
