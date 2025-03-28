const serviceSchema = require("../../models/service/service");

// exports.addService = async (req, res) => {
//   try {
//     const { service_name } = req.body;
//     const serviceImage = req.body.service_image;
//     if (serviceImage) {
//       // const imageBuffer = await sharp(serviceImage).resize({
//       //   width: 300,
//       //   height: 300,
//       //   }).toFormat('jpeg').toBuffer();
//       //   const image = await cloudinary.uploader.upload(imageBuffer, {
//       //     upload_preset: 'service',
//       //     });
//       //     req.body.service_image = image.secure_url;

//       return res.status(400).json({ error: "File is required" });
//     }
//     const service = new serviceSchema({
//       service_name,
//       service_image: serviceImage,
//     });
//     await service.save();
//     res.status(200).json({
//       status: true,
//       success: "service created successfully",
//       data: service,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.addService = async (req, res) => {
  try {
    const { service_name } = req.body;
    const serviceImage = req.body.service_image;

    if (!serviceImage) {
      return res.status(400).json({ error: "File is required" });
    }

    // Fix: Use the model correctly
    const service = new serviceSchema({
      service_name,
      service_image: serviceImage,
    });

    await service.save();
    res.status(200).json({
      status: true,
      success: "Service created successfully",
      data: service,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addServicesViaExcel = async (req, res) => {
  const serviceData = req.body;

  // Ensure we receive an array of services
  if (!Array.isArray(serviceData) || serviceData.length === 0) {
    return res
      .status(400)
      .json({ error: "No data provided or invalid format" });
  }

  try {
    // Insert services into the database
    const serviceList = await serviceSchema.insertMany(serviceData);
    if (serviceList.length > 0) {
      return res.status(200).json({ success: "Services Added", serviceList });
    } else {
      return res.status(400).json({ error: "Failed to add services" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.addRequirements = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { requirement_fields } = req.body;

    // Find the service by ID
    let findService = await serviceSchema.findOne({ _id: serviceId });

    // If service is not found, return a 404 error
    if (!findService) {
      return res
        .status(404)
        .json({ status: false, message: "Service not found" });
    }

    // Check if 'requirement_fields' exists and is an array before pushing
    if (requirement_fields && Array.isArray(findService.requirement_fields)) {
      findService.requirement_fields.push(...requirement_fields); // Use spread operator if it's an array
    } else if (requirement_fields) {
      // If `requirement_fields` is not an array, add it directly
      findService.requirement_fields = requirement_fields;
    }

    // Save the updated service document
    await findService.save();

    // Return the updated service object
    return res.status(200).json({
      status: true,
      message: "Requirement fields added successfully",
      findService,
    });
  } catch (error) {
    // Catch and return any error that occurs
    console.error("Error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAllService = async (req, res) => {
  try {
    let data = await serviceSchema.find().sort({ _id: -1 });
    return res.status(200).json({ message: "success", data: data });
  } catch (err) {
    console.log("error", err);
    res.status(400).json({ message: "fail" });
  }
};

exports.getActiveService = async (req, res) => {
  try {
    let data = await serviceSchema.find({
      isActive: true,
    });
    return res.status(200).json({ message: "success", data: data });
  } catch (err) {
    console.log("error", err);
    res.status(400).json({ message: "fail" });
  }
};

exports.getServiceByServiceName = async (req, res) => {
  try {
    const serviceName = req.params.name;
    let data = await serviceSchema.findOne({
      service_name: serviceName,
    });
    if (!data) {
      return res.status(404).json({ message: "Service not found" });
    }
    return res.status(200).json({ message: "success", service: data });
  } catch (err) {
    console.log("error", err);
    res.status(400).json({ message: "fail" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const _id = req.params.id;
    const service = await serviceSchema.findByIdAndDelete(_id);
    if (!service) {
      return res
        .status(404)
        .json({ status: false, message: "service not found" });
    }
    return res
      .status(200)
      .send({ status: true, success: "service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const service_id = req.params.id;
    const findService = await serviceSchema.findOne({ _id: service_id });

    if (!findService) {
      return res
        .status(404)
        .json({ status: false, message: "Service not found" });
    }

    // Toggle the isActive status
    findService.isActive = !findService.isActive;

    // Save the updated status
    await findService.save();

    return res.status(200).json({
      status: true,
      message: `Service ${findService.isActive ? "Activated" : "Inactivated"}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRequirementField = async (req, res) => {
  try {
    const { unique_id } = req.params; // Get unique_id from request params
    const { serviceId } = req.body; // Get service ID from request body

    // Find the service by ID
    const service = await serviceSchema.findOne({ _id: serviceId });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Filter out the requirement_fields matching the unique_id
    service.requirement_fields = service.requirement_fields.filter(
      (field) => field.unique_id !== parseInt(unique_id) // Ensure unique_id is compared as a number
    );

    // Save the updated service
    await service.save();

    res.status(200).json({
      message: "Requirement field deleted successfully",
      service,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
