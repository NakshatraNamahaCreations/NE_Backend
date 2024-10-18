const serviceSchema = require("../../models/service/service");

exports.addService = async (req, res) => {
  try {
    const { service_name } = req.body;

    // if (!req.file) {
    //   return res.status(400).json({ error: "File is required" });
    // }
    const service = new serviceSchema({
      service_name,
      // service_image: req.file.filename,
    });
    await service.save();
    res.status(200).json({
      status: true,
      success: "service created successfully",
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
