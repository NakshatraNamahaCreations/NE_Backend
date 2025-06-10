const addServiceSchema = require("../../models/vendor/add-service");
const notificationSchema = require("../../models/notifications/vendor-inapp");

exports.addVendorService = async (req, res) => {
  try {
    const {
      shop_name,
      vendor_id,
      vendor_name,
      price,
      service_description,
      service_category,
      service_subcategory,
      service_name,
      additional_services,
    } = req.body;

    if (
      !req.body.additional_images ||
      !Array.isArray(req.body.additional_images)
    ) {
      return res.status(400).json({ message: "Service images are required" });
    }

    let parsedServices = [];
    if (additional_services) {
      try {
        parsedServices =
          typeof additional_services === "string"
            ? JSON.parse(additional_services)
            : additional_services;

        // Ensure parsedServices is an array of valid objects
        if (!Array.isArray(parsedServices)) {
          return res.status(400).json({
            message: "Invalid format for additional_services, must be an array",
          });
        }

        parsedServices.forEach((service, index) => {
          if (!service.name || !service.value) {
            throw new Error(
              `Missing name or value in additional_services at index ${index}`
            );
          }
        });
      } catch (e) {
        console.warn("Invalid JSON for additional_services:", e);
        return res
          .status(400)
          .json({ message: "Invalid JSON for additional_services" });
      }
    }

    const newService = new addServiceSchema({
      shop_name,
      vendor_id,
      vendor_name,
      price,
      service_description,
      service_category,
      service_subcategory,
      service_name,
      additional_images: req.body.additional_images,
      approval_status: "Under Review",
      additional_services: parsedServices,
    });

    await newService.save();
    console.log("Service added successfully:", newService);
    res
      .status(200)
      .json({ message: "Service added successfully", product: newService });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllSerivceList = async (req, res) => {
  try {
    const allService = await addServiceSchema.find().sort({ _id: -1 });

    if (allService.length < 0) {
      return res.status(404).json({ message: "service not found" });
    }
    res.status(200).json(allService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllApprovedServices = async (req, res) => {
  try {
    // const limit = parseInt(req.query.limit) || 10;

    // if (limit <= 0) {
    //   return res.status(400).json({ message: "Invalid limit parameter" });
    // }

    const allServices = await addServiceSchema
      .find({
        approval_status: "Approved",
      })
      .sort({ _id: -1 });
    if (allServices.length < 0) {
      console.log("no services found");
      return res.status(404).json({ message: "Services not found" });
    }
    return res.status(200).json({ data: allServices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getServiceByVendorId = async (req, res) => {
  try {
    const vendorServices = await addServiceSchema
      .find({
        vendor_id: req.params.id,
        approval_status: "Approved",
      })
      .sort({ _id: -1 });

    if (!vendorServices || vendorServices.length === 0) {
      console.log("No Service found");
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ service: vendorServices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getVendorService = async (req, res) => {
  try {
    const vendorServices = await addServiceSchema
      .find({
        vendor_id: req.params.id,
      })
      .sort({ _id: -1 });

    if (!vendorServices || vendorServices.length === 0) {
      console.log("No Service found");
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ service: vendorServices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSerivceByServiceId = async (req, res) => {
  try {
    const findService = await addServiceSchema.findOne({
      _id: req.params.id,
    });

    if (!findService) {
      console.log("No Service found");
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ service: findService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.editService = async (req, res) => {
  try {
    const productId = req.params.id;
    const fintProduct = await addServiceSchema.findOne({ _id: productId });
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

    let updateProduct = await addServiceSchema.findOneAndUpdate(
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

exports.blockServiceAvailability = async (req, res) => {
  try {
    const { serviceId, blockedStartDate, blockedEndDate } = req.body;

    if (!serviceId || !Array.isArray(serviceId) || serviceId.length === 0) {
      return res.status(400).json({ message: "Service ID array is required" });
    }

    const availableService = await addServiceSchema.updateMany(
      { _id: { $in: serviceId } },
      {
        $set: {
          available_start_date: blockedStartDate,
          available_end_date: blockedEndDate,
        },
      }
    );
    console.log("availableService", availableService);
    res.status(200).json({
      message: "Service blocked successfully",
      status: true,
      data: availableService,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.writeReviewForService = async (req, res) => {
  try {
    const { user_id, user_name, review_title, review_description, ratings } =
      req.body;

    const serviceId = req.params.id;
    const findService = await addServiceSchema.findOne({ _id: serviceId });
    if (!findService) {
      console.log("service not found");
      return res.status(404).json({ message: "service not found" });
    }

    const rating = Number(ratings);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Invalid rating value. It should be between 1 and 5.",
      });
    }

    findService.Reviews.push({
      user_id,
      user_name,
      review_title,
      review_description,
      ratings: rating,
    });
    await findService.save();

    res.status(200).json({ message: "Review added successfully", findService });
  } catch (error) {
    console.error(error);
  }
};

exports.getReviewByServiceId = async (req, res) => {
  try {
    const service = await addServiceSchema.findOne({ _id: req.params.id });
    if (!service) {
      return res.status(404).json({ message: "services not found" });
    }
    res.status(200).json({ reviews: service.Reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// approval_status
exports.approveServices = async (req, res) => {
  try {
    let servicesId = req.params.id;
    let findServices = await addServiceSchema.findOne({ _id: servicesId });
    if (!findServices) {
      console.log("Services not found");
      return res.status(404).json({ message: "Services not found" });
    }
    findServices.approval_status = "Approved";
    await findServices.save();
    await notificationSchema.create({
      vendor_id: findServices.vendor_id, // Assuming the Services has a vendor_id field
      Services_id: servicesId,
      notification_type: "Services_approval",
      message: `Your Services "${findServices.Services_name}" has been approved.`,
      status: "unread",
      metadata: {}, // Add additional metadata if needed
      created_at: new Date(),
    });
    res.status(200).json({
      message: "Services approved successfully",
      approval_status: findServices.approval_status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.disApproveService = async (req, res) => {
  try {
    const { reason_for_disapprove } = req.body;
    let serviceId = req.params.id;
    let findService = await addServiceSchema.findOne({ _id: serviceId });
    if (!findService) {
      console.log("service not found");
      return res.status(404).json({ message: "service not found" });
    }
    findService.approval_status = "Disapproved";
    findService.isActive = false;
    findService.reason_for_disapprove = reason_for_disapprove;
    await findService.save();
    await notificationSchema.create({
      vendor_id: findService.vendor_id, // Assuming the product has a vendor_id field
      product_id: serviceId,
      notification_type: "service_approval",
      message: `Your service "${findService.product_name}" has been disapproved.`,
      status: "unread",
      metadata: {}, // Add additional metadata if needed
      created_at: new Date(),
    });
    res
      .status(200)
      .json({ message: "Product disapproved successfully", findService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const deletedService = await addServiceSchema.findOneAndDelete({
      _id: req.params.id,
    });
    if (!deletedService) {
      return res.status(404).json({ message: "serivce not found" });
    }
    res.status(200).json({
      message: "serivce deleted successfully",
      serivce: deletedService,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
