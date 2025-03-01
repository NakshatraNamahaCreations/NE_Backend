const { default: axios } = require("axios");
const wishlistSchema = require("../../models/wishlist/wishlist");

exports.addWishlist = async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      product_name,
      product_image,
      product_price,
      mrp_price,
      discount,
    } = req.body;
    const findWishlist = await wishlistSchema.findOne({
      product_id: product_id,
      user_id: user_id,
    });
    if (findWishlist) {
      return res
        .status(400)
        .json({ message: "Product already exists in user's wishlist" });
    }

    const wishlist = new wishlistSchema({
      user_id,
      product_id,
      product_name,
      product_image,
      product_price,
      mrp_price,
      discount,
    });
    await wishlist.save();
    res.status(201).json({ message: "Wishlist added successfully", wishlist });
  } catch (err) {
    res.status(500).json({ message: "Error adding wishlist", error: err });
  }
};
exports.getMyWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistSchema.find({ user_id: req.params.id });
    if (!wishlist || wishlist.length === 0) {
      return res.status(404).json({ message: "No wishlist found" });
    }
    return res.status(200).json({ wishlist });
  } catch (err) {
    console.log("error returing wishlist", err);
    res.status(500).json({ message: "Error fetching wishlist", error: err });
  }
};

exports.removeWishlist = async (req, res) => {
  try {
    const wishlistId = req.params.id;
    const wishlist = await wishlistSchema.findByIdAndDelete({
      _id: wishlistId,
    });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }
    res.status(200).json({ message: "Wishlist removed successfully" });
  } catch (err) {
    console.log("error removing wishlist", err);
    res.status(500).json({ message: "Error removing wishlist", error: err });
  }
};
