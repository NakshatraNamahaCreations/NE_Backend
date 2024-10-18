const serviceSchema = require("../../models/service/sub-service");

exports.addSubService = async (req, res) => {
  try {
    const { service_name, service_id, sub_service_name } = req.body;
    const service = new serviceSchema({
      service_name,
      service_id,
      sub_service_name,
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

// exports.addServicesViaExcel = async (req, res) => {
//   const serviceData = req.body;

//   // Ensure we receive an array of services
//   if (!Array.isArray(serviceData) || serviceData.length === 0) {
//     return res
//       .status(400)
//       .json({ error: "No data provided or invalid format" });
//   }

//   try {
//     // Insert services into the database
//     const serviceList = await serviceSchema.insertMany(serviceData);
//     if (serviceList.length > 0) {
//       return res.status(200).json({ success: "Services Added", serviceList });
//     } else {
//       return res.status(400).json({ error: "Failed to add services" });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

exports.getSubserviceByService = async (req, res) => {
  let { service_name } = req.body;
  let data = await serviceSchema.find({
    service_name,
  });
  if (data) {
    return res.json({ service: data });
  } else {
    return res.json({ error: "not able to complete" });
  }
};

exports.getAllSubService = async (req, res) => {
  try {
    let data = await serviceSchema.find().sort({ _id: -1 });
    res.status(200).json({ message: "success", data: data });
  } catch (err) {
    console.log("error", err);
    res.status(400).json({ message: "fail" });
  }
};

exports.deleteSubService = async (req, res) => {
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
