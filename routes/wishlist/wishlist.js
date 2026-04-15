const express = require("express");
const router = express.Router();
const {
  addWishlist,
  getMyWishlist,
  getWishlistById,
  removeWishlist,
} = require("../../controllers/wishlist/wishlist");

router.post("/add-wishlist", addWishlist);
router.get("/get-wishlist-by-id/:id", getWishlistById);
router.get("/get-my-wishlist/:id", getMyWishlist);
router.delete("/remove-wishlist-list/:id", removeWishlist);

module.exports = router;
