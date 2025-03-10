const productSchema = require("../../models/vendor/product");
const notificationSchema = require("../../models/notifications/vendor-inapp");
exports.addProduct = async (req, res) => {
  try {
    if (!req.body.product_image || !Array.isArray(req.body.product_image)) {
      return res.status(400).json({ message: "Product images are required" });
    }

    const {
      shop_name,
      vendor_id,
      vendor_name,
      product_category,
      product_type,
      product_name,
      product_price,
      mrp_rate,
      discount,
      brand,
      stock_in_hand,
      model_name,
      material_type,
      product_dimension,
      product_weight,
      country_of_orgin,
      warranty,
      manufacturer_name,
      product_color,
      Specifications,
      retuning_date,
    } = req.body;

    let specificationsArray;
    try {
      specificationsArray = JSON.parse(Specifications);
    } catch (e) {
      console.log("specifications:", e);
    }
    const newProduct = new productSchema({
      shop_name,
      vendor_id,
      vendor_name,
      product_category,
      product_type,
      product_name,
      product_image: req.body.product_image,
      product_video: req.body.product_video,
      mrp_rate,
      product_price,
      discount,
      brand,
      stock_in_hand,
      model_name,
      material_type,
      product_dimension,
      product_weight,
      country_of_orgin,
      warranty,
      manufacturer_name,
      product_color,
      retuning_date,
      approval_status: "Under Review",
      Specifications: specificationsArray,
    });
    await newProduct.save();
    console.log("Product added successfully:", newProduct);
    res
      .status(200)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    const allProduct = await productSchema.find();

    if (allProduct.length < 0) {
      return res.status(404).json({ message: "products not found" });
    }
    res.status(200).json(allProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllRentalProduct = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    if (limit <= 0) {
      return res.status(400).json({ message: "Invalid limit parameter" });
    }

    const allRentalProduct = await productSchema.find({
      product_type: "rental",
      approval_status: "Approved",
    });
    if (allRentalProduct.length < 0) {
      console.log("no products found");
      return res.status(404).json({ message: "products not found" });
    }
    res.status(200).json({ data: allRentalProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.getRelevantProducts = async (req, res) => {
//   try {
//     const limit = parseInt(req.query.limit) || 10;

//     if (limit <= 0) {
//       return res.status(400).json({ message: "Invalid limit parameter" });
//     }
//     const category = req.query.product_category;
//     console.log("category", category);

//     const allProducts = await productSchema
//       .find({
//         product_type: "rental",
//         approval_status: "Approved",
//         product_category: category,
//       })
//       .limit(limit);
//     if (allProducts.length === 0) {
//       console.log("no products found");
//       return res.status(404).json({ message: "products not found" });
//     }
//     res.status(200).json({ data: allProducts, categoryName: category });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getRelevantProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit); // Parse limit (could be undefined)
    const page = parseInt(req.query.page) || 1; // Default page is 1
    const skip = (page - 1) * limit; // Calculate skip only if limit is provided

    if (limit && (limit <= 0 || page <= 0)) {
      return res
        .status(400)
        .json({ message: "Invalid limit or page parameter" });
    }

    const category = req.query.product_category;
    console.log("category", category);

    // Base query
    const query = {
      product_type: "rental",
      approval_status: "Approved",
      product_category: category,
    };

    // Fetch products
    let allProducts;
    if (limit) {
      // Apply pagination if limit is provided
      allProducts = await productSchema.find(query).skip(skip).limit(limit);
    } else {
      // Return all products if limit is not provided
      allProducts = await productSchema.find(query);
    }

    if (allProducts.length === 0) {
      console.log("No products found");
      return res.status(404).json({ message: "Products not found" });
    }

    res.status(200).json({ data: allProducts, categoryName: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    if (limit <= 0) {
      return res.status(400).json({ message: "Invalid limit parameter" });
    }

    const featuredProducts = await productSchema
      .find({
        product_type: "rental",
        approval_status: "Approved",
        isFeatured: true,
      })
      .limit(limit);

    if (featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
    }

    return res.status(200).json({
      status: true,
      message: "Featured products fetched successfully",
      data: featuredProducts,
      length: featuredProducts.length,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const fintProduct = await productSchema.findOne({ _id: productId });
    if (!fintProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    const {
      product_category,
      product_name,
      product_price,
      mrp_rate,
      discount,
      brand,
      stock_in_hand,
      model_name,
      material_type,
      product_dimension,
      product_weight,
      country_of_orgin,
      warranty,
      manufacturer_name,
      product_color,
    } = req.body;

    fintProduct.product_category =
      product_category || fintProduct.product_category;
    fintProduct.product_name = product_name || fintProduct.product_name;
    fintProduct.product_price = product_price || fintProduct.product_price;
    fintProduct.mrp_rate = mrp_rate || fintProduct.mrp_rate;
    fintProduct.discount = discount || fintProduct.discount;
    fintProduct.brand = brand || fintProduct.brand;
    fintProduct.stock_in_hand = stock_in_hand || fintProduct.stock_in_hand;
    fintProduct.model_name = model_name || fintProduct.model_name;
    fintProduct.material_type = material_type || fintProduct.material_type;
    fintProduct.product_dimension =
      product_dimension || fintProduct.product_dimension;
    fintProduct.product_weight = product_weight || fintProduct.product_weight;
    fintProduct.country_of_orgin =
      country_of_orgin || fintProduct.country_of_orgin;
    fintProduct.warranty = warranty || fintProduct.warranty;
    fintProduct.manufacturer_name =
      manufacturer_name || fintProduct.manufacturer_name;
    fintProduct.product_color = product_color || fintProduct.product_color;
    fintProduct.product_image =
      req.body.product_image || fintProduct.product_image;
    fintProduct.product_video =
      req.body.product_video || fintProduct.product_video;
    fintProduct.approval_status = "Under Review";

    let updateProduct = await productSchema.findOneAndUpdate(
      { _id: productId },
      fintProduct,
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "Product updated successfully",
      status: true,
      data: updateProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getParticularVendorProduct = async (req, res) => {
  try {
    const vendorId = req.params.id;

    // Query the database for all rental products with the vendor ID
    const allRentalProducts = await productSchema.find({
      vendor_id: vendorId,
      product_type: "rental",
      approval_status: "Approved",
    });

    // Check if no products are found
    if (!allRentalProducts || allRentalProducts.length === 0) {
      console.log("No products found");
      return res.status(404).json({ message: "Products not found" });
    }

    // Return the found products
    res.status(200).json(allRentalProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    // let productId = req.params.id;
    const product = await productSchema.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "products not found" });
    }
    res.status(200).json({ product: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// find and get the products exclued vendor id // check thw approval status
exports.filteroutVendorProduct = async (req, res) => {
  try {
    let vendorId = req.params.id;
    let allSellingProduct = await productSchema.find({
      approval_status: "Approved",
    });
    // const vendorProducts  = await productSchema.find({ vendor_id: vendorId });
    let remainingProducts = allSellingProduct.filter(
      (product) => product.vendor_id.toString() !== vendorId
    );
    // console.log(
    //   "remainingProducts",
    //   remainingProducts.find({ product_type: "sell" })
    // );
    return res.status(200).json({ products: remainingProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getVendorProduct = async (req, res) => {
  try {
    let vendorId = req.params.id;
    let allProductFromVendor = await productSchema.find({
      vendor_id: vendorId,
    });
    if (allProductFromVendor) {
      return res.status(200).json({ products: allProductFromVendor });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReview = async (req, res) => {
  try {
    // let productId = req.params.id;
    const product = await productSchema.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "products not found" });
    }
    // console.log("product", product);
    res.status(200).json({ reviews: product.Reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSellProduct = async (req, res) => {
  try {
    const allSellProduct = await productSchema
      .find({ product_type: "sell", approval_status: "Approved" })
      .sort({ _id: -1 });

    if (allSellProduct.length < 0) {
      return res.status(404).json({ message: "products not found" });
    }
    res.status(200).json({ allSellProduct: allSellProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRentalProductForAdmin = async (req, res) => {
  try {
    const allRentalProduct = await productSchema.find({
      product_type: "rental",
    });

    if (allRentalProduct.length < 0) {
      return res.status(404).json({ message: "products not found" });
    }
    res.status(200).json({ allRentalProduct: allRentalProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSellForAdminProduct = async (req, res) => {
  try {
    const allSellProduct = await productSchema.find({ product_type: "sell" });

    if (allSellProduct.length < 0) {
      return res.status(404).json({ message: "products not found" });
    }
    res.status(200).json({ allSellProduct: allSellProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.writeReview = async (req, res) => {
  // console.log("api hitting");
  try {
    // console.log("api hitting");
    const { user_id, user_name, review_title, review_description, ratings } =
      req.body;
    // if (
    //   !user_id ||
    //   !userName ||
    //   !review_title ||
    //   !review_description ||
    //   !ratings
    // ) {
    //   return res.status(400).json({ message: "Missing required fields" });
    // }
    // console.log("Request Body:", req.body);
    // console.log("Product ID:", req.params.id);

    let productId = req.params.id;
    // console.log("productId", productId);
    let findProduct = await productSchema.findOne({ _id: productId });
    if (!findProduct) {
      console.log("Product not found");
      return res.status(404).json({ message: "product not found" });
    }

    const rating = Number(ratings);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Invalid rating value. It should be between 1 and 5.",
      });
    }

    findProduct.Reviews.push({
      user_id,
      user_name,
      review_title,
      review_description,
      ratings: rating,
    });
    await findProduct.save();

    res.status(200).json({ message: "Review added successfully", findProduct });
  } catch (error) {
    console.error(error);
  }
};

exports.productStatusChange = async (req, res) => {
  try {
    const product_id = req.params.id;
    const findProduct = await productSchema.findOne({ _id: product_id });

    if (!findProduct) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    // Toggle the isActive status
    findProduct.isActive = !findProduct.isActive;

    // Save the updated status
    await findProduct.save();

    return res.status(200).json({
      status: true,
      message: `Product ${findProduct.isActive ? "Activated" : "Inactivated"}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// approval_status
exports.approveProduct = async (req, res) => {
  try {
    let productId = req.params.id;
    let findProduct = await productSchema.findOne({ _id: productId });
    if (!findProduct) {
      console.log("Product not found");
      return res.status(404).json({ message: "product not found" });
    }
    findProduct.approval_status = "Approved";
    await findProduct.save();
    await notificationSchema.create({
      vendor_id: findProduct.vendor_id, // Assuming the product has a vendor_id field
      product_id: productId,
      notification_type: "product_approval",
      message: `Your product "${findProduct.product_name}" has been approved.`,
      status: "unread",
      metadata: {}, // Add additional metadata if needed
      created_at: new Date(),
    });
    res.status(200).json({
      message: "Product approved successfully",
      approval_status: findProduct.approval_status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.disApproveProduct = async (req, res) => {
  try {
    const { reason_for_disapprove } = req.body;
    let productId = req.params.id;
    let findProduct = await productSchema.findOne({ _id: productId });
    if (!findProduct) {
      console.log("Product not found");
      return res.status(404).json({ message: "product not found" });
    }
    findProduct.approval_status = "Disapproved";
    findProduct.isActive = "Disapproved";
    findProduct.reason_for_disapprove = reason_for_disapprove;
    await findProduct.save();
    await notificationSchema.create({
      vendor_id: findProduct.vendor_id, // Assuming the product has a vendor_id field
      product_id: productId,
      notification_type: "product_approval",
      message: `Your product "${findProduct.product_name}" has been disapproved.`,
      status: "unread",
      metadata: {}, // Add additional metadata if needed
      created_at: new Date(),
    });
    res
      .status(200)
      .json({ message: "Product disapproved successfully", findProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await productSchema.findOneAndDelete({
      _id: req.params.id,
    });
    if (!deletedProduct) {
      return res.status(404).json({ message: "product not found" });
    }
    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// for admin
exports.addProductsViaExcel = async (req, res) => {
  const productData = req.body;

  if (!Array.isArray(productData) || productData.length === 0) {
    return res
      .status(400)
      .json({ error: "No data provided or invalid format" });
  }

  try {
    // Add approval_status: true to each product
    const updatedProductData = productData.map((product) => ({
      ...product,
      approval_status: "Under Review",
    }));

    const serviceList = await productSchema.insertMany(updatedProductData);
    if (serviceList.length > 0) {
      return res.status(200).json({ success: "Products Added", serviceList });
    } else {
      return res.status(400).json({ error: "Failed to add services" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
// for admin
exports.addProductImage = async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate product_image existence
    if (!req.body.product_image || !Array.isArray(req.body.product_image)) {
      return res.status(400).json({ message: "Product images are required." });
    }

    // Find the product by ID
    const findProduct = await productSchema.findOne({ _id: productId });
    if (!findProduct) {
      console.log("Product not found.");
      return res.status(404).json({ message: "Product not found." });
    }

    // Add images to the product
    const updatedProduct = await productSchema.findByIdAndUpdate(
      productId,
      { $push: { product_image: { $each: req.body.product_image } } }, // Append the images array
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(500).json({ message: "Failed to update product." });
    }

    return res.status(200).json({
      message: "Product images added successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error in addProductImage API:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", details: error.message });
  }
};

exports.searchProduct = async (req, res) => {
  try {
    const query = req.query;
    const searchQuery = (query.search || "").toLowerCase();
    const limit = parseInt(query.limit) || 10;
    const skip = parseInt(query.skip) || 0;

    const category = (query.category || "").toLowerCase();
    const name = (query.product_name || "").toLowerCase();
    const brand = (query.brand || "").toLowerCase();

    const filter = {
      ...(searchQuery && { name: { $regex: searchQuery, $options: "i" } }),
      ...(category && { product_category: category }),
      ...(brand && { brand }),
      ...(name && { product_name: name }),
    };

    const products = await productSchema.find(filter).skip(skip).limit(limit);

    return res.status(200).json({
      message: "Products found successfully.",
      products: products,
      lenght: products.length,
    });
  } catch (error) {
    console.error("Error in searchProduct API:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", details: error.message });
  }
};

// exports.searchProduct = async (req, res) => {
//   try {
//     const query = req.query;
//     const searchQuery = query.search || "";
//     const limit = query.limit || 10;
//     const skip = query.skip || 0;
//     const sort = query.sort || "name";
//     const order = query.order || "asc";
//     const category = query.category || "";
//     const price = query.price || "";
//     const rating = query.rating || "";
//     const brand = query.brand || "";
//     const minPrice = query.minPrice || "";
//     const maxPrice = query.maxPrice || "";
//     const minRating = query.minRating || "";
//     const maxRating = query.maxRating || "";
//     const sortBy = query.sortBy || "name";
//     const orderBy = query.orderBy || "asc";
//     const filter = {
//       name: { $regex: searchQuery, $options: "i" },
//       category: category,
//       price: { $gte: minPrice, $lte: maxPrice },
//       rating: { $gte: minRating, $lte: maxRating },
//       brand: brand,
//     };
//     const sortOptions = {
//       [sortBy]: order === "desc" ? -1 : 1,
//     };
//     const products = await productSchema.find(filter)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(limit);
//     return res.status(200).json({
//       message: "Products found successfully.",
//       products: products,
//     });
//   } catch (error) {
//     console.error("Error in searchProduct API:", error);
//     return res
//       .status(500)
//       .json({ message: "Internal server error.", details: error.message });
//   }
// };

// [
// {orderId: "97738140289314444839",id: "67598de073ce3758dc50907e",productName: "RCF HDL20 Tops",productPrice: 2500,mrpPrice: 2500,store: "Ramdev Electricals Rent",imageUrl:"https://my-s3-image-storage.s3.us-east-1.amazonaws.com/product_files/1733997693945-RCF HDL20 Tops.png",productDimension: "32.6D x 68.8W x 36.8H Centimeters",totalPrice: 5000,quantity: 2,context: "product",sellerName: "Kanna Devan",sellerId: "67062e43e0297d4e91ab505a",eventStartDate: "2024-01-20",eventEndDate: "2024-01-20",commissionTax: 18,commissionPercentage: 20},
//   {
//     orderId: "73104260950546984060",
//     id: "67598de073ce3758dc5090a3",
//     productName: "Silent Communication Units",
//     productPrice: 1500,
//     mrpPrice: 1500,
//     store: "Pavan Rentals Supply",
//     imageUrl:
//       "https://my-s3-image-storage.s3.us-east-1.amazonaws.com/product_files/1733924762560-silent-conference-wireless-audio-communication-system-500x500.jpg.webp",
//     productDimension: "27.5 x 25.8 x 51.5 Centimeters",
//     totalPrice: 4500,
//     quantity: 3,
//     context: "product",
//     sellerName: "Pavan Kumar",
//     sellerId: "67062f54e0297d4e91ab5083",
//     eventStartDate: "2024-01-20",
//     eventEndDate: "2024-01-20",
//     commissionTax: 18,
//     commissionPercentage: 20,
//   },
// ];

// [
//   {orderId: "42522766168849129449",service_id: "67614adb8f4328508f0c818b",category: "Sound",price: 2000,service_name: "Sound Engineer",shop_name: "SRI KOTTURESHWARA ELECTRICALS",vendor_id: "67062d0fe0297d4e91ab5048",vendor_name: "Mallappa Potanakatti",eventStartDate: "2024-01-20",eventEndDate: "2024-01-20",quantity: 3,totalPrice: 6000,commissionPercentage: 20,commissionTax: 18},
//   {
//     orderId: "67536612198781889303",
//     service_id: "675be756df27f6d4a8e33f2c",
//     category: "Lighting",
//     price: 6800,
//     service_name: "Technician",
//     shop_name: "Mani Electricals",
//     vendor_id: "670622e9668b7b32798e6c96",
//     vendor_name: "Mani thiruvengadam",
//     eventStartDate: "2024-01-20",
//     eventEndDate: "2024-01-20",
//     quantity: 3,
//     totalPrice: 20400,
//     commissionPercentage: 20,
//     commissionTax: 18,
//   },
// ];
