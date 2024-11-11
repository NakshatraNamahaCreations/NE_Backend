const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createTicket,
  getAllTickets,
  getTicketById,
  changeTicketStatus,
} = require("../../controllers/ticketing/ticket");

const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/ticket/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/create-ticket", upload.single("attachment_file"), createTicket);
router.get("/get-all-tickets", getAllTickets);
router.get("/get-ticket-by-id/:id", getTicketById);
router.put("/change-status/:id", changeTicketStatus);

module.exports = router;
