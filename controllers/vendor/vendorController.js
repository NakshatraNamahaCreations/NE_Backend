const vendorSchema = require("../../models/vendor/vendor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const crypto = require("crypto");
const otpSchema = require("../../models/otp/otp");
const { sendOTP, sendResetMessage } = require("../../utils/sendMail");

exports.vendorRegister = async (req, res) => {
  try {
    const {
      vendor_name,
      email,
      mobile_number,
      password,
      profession,
      profession_category,
      bank_name,
      account_holder_name,
      account_number,
      ifsc_code,
      bank_branch_name,
      profession_type,
    } = req.body;

    const existingMobileNumber = await vendorSchema.findOne({ mobile_number });
    if (existingMobileNumber) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    const existingVendor = await vendorSchema.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newVendor = new vendorSchema({
      vendor_name,
      email,
      password: hashedPassword,
      mobile_number,
      profession,
      profession_category,
      bank_name,
      account_holder_name,
      account_number,
      ifsc_code,
      bank_branch_name,
      is_approved: false,
      commission_percentage: 22,
      commission_tax: 18,
      profession_type,
    });

    await newVendor.save();

    res.status(200).json({ message: "Please add business details", newVendor });
  } catch (error) {
    console.error("error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    res.status(500).json({ message: "Server error", error });
  }
};

exports.addVendorBusinessDetails = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const findVendor = await vendorSchema.findOne({ _id: vendorId });
    if (!findVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    const {
      shop_name,
      godown_name,
      godown_pin,
      gst_number,
      pan_number,
      vehicle_name,
      number_plate,
      vehicle_by,
    } = req.body;

    const updatedVendor = await vendorSchema.findByIdAndUpdate(
      vendorId,
      {
        shop_name: shop_name,
        godown_name: godown_name,
        godown_pin: godown_pin,
        gst_number: gst_number,
        pan_number: pan_number,
        vehicle_name: vehicle_name,
        number_plate: number_plate,
        vehicle_by: vehicle_by,
        shop_image_or_logo: req.body.shop_image_or_logo,
        vehicle_image: req.body.vehicle_image,
        aadhaar_front: req.body.aadhaar_front,
        aadhaar_back: req.body.aadhaar_back,
      },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Shop details added successfully! Please add business address",
      vendorShop: updatedVendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addServiceUserBusinessDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("userId", userId);
    const findUser = await vendorSchema.findOne({ _id: userId });
    console.log("findUser", findUser);
    if (!findUser) {
      return res.status(401).json({ message: "user not found" });
    }
    const {
      experience_in_business,
      year_of_establishment,
      website_url,
      gst_number,
      pricing,
      // business_hours,
      shop_name,
    } = req.body;

    // const parsedBusinessHours = Array.isArray(business_hours)
    //   ? business_hours
    //   : JSON.parse(business_hours);

    const updatedVendor = await vendorSchema.findByIdAndUpdate(
      userId,
      {
        shop_name: shop_name,
        year_of_establishment: year_of_establishment,
        website_url: website_url,
        pricing: pricing,
        gst_number: gst_number,
        // business_hours: parsedBusinessHours,
        experience_in_business: experience_in_business,
        shop_image_or_logo: req.body.shop_image_or_logo,
        aadhaar_front: req.body.aadhaar_front,
        aadhaar_back: req.body.aadhaar_back,
        // commission_percentage: 22,
        // commission_tax: 18,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Business details added successfully",
      serviceUser: updatedVendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addAdditionalServices = async (req, res) => {
  try {
    const userId = req.params.id;

    const findUser = await vendorSchema.findOne({ _id: userId });
    if (!findUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const { additional_services, additional_images } = req.body;

    let fieldsObj;
    try {
      fieldsObj = JSON.parse(additional_services);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid additional services format" });
    }

    const updatedFields = Array.isArray(findUser.additional_services)
      ? [...findUser.additional_services]
      : [];

    Object.keys(fieldsObj).forEach((parameter) => {
      const existingFieldIndex = updatedFields.findIndex(
        (field) => field.parameter === parameter
      );

      if (existingFieldIndex !== -1) {
        updatedFields[existingFieldIndex].value = fieldsObj[parameter];
      } else {
        updatedFields.push({
          parameter: parameter,
          value: fieldsObj[parameter],
        });
      }
    });

    findUser.additional_services = updatedFields;

    // if (req.body && req.body.additional_images) {
    //   const service_images = req.body.additional_images.map(
    //     (file) => file.path
    //   );
    //   findUser.additional_images = service_images;
    // } else {
    //   console.log("No images uploaded or wrong field name.");
    // }

    if (additional_images && additional_images.length > 0) {
      findUser.additional_images = additional_images; // Assign the array of S3 URLs
    } else {
      console.log("No images found to assign to the user.");
    }

    await findUser.save();

    res.status(200).json({
      message: "Services added successfully",
      serviceUser: findUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// // NOT REQUIRED
// exports.addServiceRequiredFields = async (req, res) => {
//   try {
//     const vendorId = req.params.id;
//     console.log("vendorId", vendorId);
//     const { requirement_fields, shop_name } = req.body;

//     const shop_image_or_logo = req.files["shop_image_or_logo"]
//       ? req.files["shop_image_or_logo"][0].path
//       : null;

//     // const shop_image_or_logo = req.file
//     //   ? `public/vendor_profile/${req.file.filename}`
//     //   : null;

//     const findVendor = await vendorSchema.findOne({ _id: vendorId });
//     if (!findVendor) {
//       return res.status(404).json({ message: "Vendor not found" });
//     }

//     if (shop_name) {
//       findVendor.shop_name = shop_name;
//     }

//     // const shopImageOrLogo = req.files["shop_image_or_logo"]
//     // ? req.files["shop_image_or_logo"][0].path
//     // : null;

//     if (shop_image_or_logo) {
//       findVendor.shop_image_or_logo = shop_image_or_logo;
//     }

//     const updatedFields = [...findVendor.requirement_fields];
//     const fieldsObj = JSON.parse(requirement_fields);

//     Object.keys(fieldsObj).forEach((parameter) => {
//       const existingFieldIndex = updatedFields.findIndex(
//         (field) => field.parameter === parameter
//       );

//       if (existingFieldIndex !== -1) {
//         updatedFields[existingFieldIndex].value = requirement_fields[parameter];
//       } else {
//         updatedFields.push({
//           parameter: parameter,
//           value: fieldsObj[parameter],
//         });
//       }
//     });

//     findVendor.requirement_fields = updatedFields;

//     await findVendor.save();
//     res.status(200).json({
//       message: "Service people business details added successfully",
//       data: findVendor,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // NOT REQUIRED
// exports.addServiceAdditionalDetails = async (req, res) => {
//   try {
//     const vendorId = req.params.id;
//     console.log("vendorId", vendorId);
//     const findVendor = await vendorSchema.findOne({ _id: vendorId });
//     console.log("findVendor", findVendor);
//     if (!findVendor) {
//       return res.status(404).json({ message: "Vendor not found" });
//     }
//     const { gst_number, pan_number } = req.body;

//     // Check if images exist
//     const additional_image = req.files.images
//       ? req.files.images?.map((file) => file.path)
//       : [];

//     // console.log("Request Body:", req.body);
//     // console.log("Request Files:", req.files);

//     const updatedVendor = await vendorSchema.findByIdAndUpdate(
//       vendorId,
//       {
//         gst_number: gst_number,
//         pan_number: pan_number,
//         additional_image,
//       },
//       { new: true }
//     );

//     if (!updatedVendor) {
//       return res.status(404).json({ message: "Vendor not found" });
//     }

//     res.status(200).json({
//       message: "Shop details added successfully! Please add business address",
//       // message: "Shop details updated successfully",
//       vendor: updatedVendor,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.vendorLoginWithGmail = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    // Find the vendor by email
    const vendor = await vendorSchema.findOne({ email });
    if (!vendor) {
      return res.status(400).json({ message: "email not match" });
    }
    // console.log("vendor found:", vendor);

    // console.log("user", vendor.password);

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password not match" });
    }
    console.log("Password match:", isMatch);
    // Generate JWT token
    const accessToken = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { id: vendor._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.status(200).json({
      message: "Login Success",
      accessToken,
      refreshToken,
      vendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// login with mobile number
exports.loginWithMobile = async (req, res) => {
  const { mobile_number } = req.body;
  try {
    if (!mobile_number) {
      return res.status(400).json({ error: "Mobile number required" });
    }
    // Find the vendor by mobile number
    const vendor = await vendorSchema.findOne({ mobile_number });
    if (!vendor) {
      return res.status(400).json({ message: "mobile number not match" });
    }
    if (vendor.is_approved === false) {
      return res.status(400).json({ message: "Your account is not approved!" });
    }
    const accessToken = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { id: vendor._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.status(200).json({
      message: "Login Success",
      accessToken,
      refreshToken,
      vendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginWithGoogle = async (req, res) => {
  const { token, email } = req.body;
  console.log("Received token:", token);
  try {
    // const ticket = await client.verifyIdToken({
    //   idToken: token,
    //   audience: CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
    // });

    // const payload = ticket.getPayload();
    // if (!payload) {
    //   return res.status(400).json({ message: "Invalid token" });
    // }
    const user = await vendorSchema.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    res.status(200).json({ message: "Login successfully", user });
  } catch (error) {
    console.error("Google Sign-In Verification:", error);
    res.status(500).json({ error: "Invalid token" });
  }
};

// add final check for find only approved vendor
exports.getAllFilteroutVendor = async (req, res) => {
  try {
    const findVendor = req.params.id;
    console.log("findVendor", findVendor);
    const allVendor = await vendorSchema.find({});
    const remaingVendor = allVendor.filter(
      (vendor) => vendor._id !== findVendor
    );
    // console.log("remaingVendor", remaingVendor);
    res.status(200).json({ remaingVendor: remaingVendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getVendorProfile = async (req, res) => {
  try {
    // console.log("Received Vendor ID:", req.params);
    const vendor = await vendorSchema
      .findOne({ _id: req.params.id })
      .select("-password");
    // console.log("Vendor data from DB:", vendor);
    if (!vendor) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(vendor);
  } catch (error) {
    console.error("Error in getVendorProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllVendor = async (req, res) => {
  try {
    const allVendor = await vendorSchema
      .find({ is_approved: true })
      .sort({ _id: -1 });
    if (allVendor.length > 0) {
      return res.status(200).json(allVendor);
    } else {
      return res.status(404).json({ message: "No vendor found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllVendorsForAdmin = async (req, res) => {
  try {
    const allVendor = await vendorSchema.find();
    if (allVendor.length > 0) {
      return res.status(200).json(allVendor);
    } else {
      return res.status(404).json({ message: "No vendor found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOnlyProductVendor = async (req, res) => {
  try {
    const productVendor = await vendorSchema
      .find({
        profession: "Vendor & Seller",
        is_approved: true,
      })
      .sort({ _id: -1 });
    if (productVendor.length > 0) {
      return res.status(200).json({ data: productVendor });
    } else {
      return res.status(404).json({ message: "No vendor found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOnlyServiceVendor = async (req, res) => {
  try {
    const serviceVendor = await vendorSchema
      .find({
        profession: { $ne: "Vendor & Seller" },
        is_approved: true,
      })
      .sort({ _id: -1 });
    if (serviceVendor.length > 0) {
      return res.status(200).json({ data: serviceVendor });
    } else {
      console.log("no service vendors found");
      return res.status(404).json({ message: "No vendor found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getVendorByServiceName = async (req, res) => {
  try {
    const vendorList = await vendorSchema
      .find({
        profession: req.params.name,
        is_approved: true,
      })
      .sort({ _id: -1 });
    if (vendorList.length > 0) {
      return res.status(200).json({ data: vendorList });
    } else {
      return res.status(404).json({ message: "No vendor found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.writeReview = async (req, res) => {
  try {
    const { user_id, user_name, review_title, review_description, ratings } =
      req.body;

    const serviceId = req.params.id;
    const findService = await vendorSchema.findOne({ _id: serviceId });
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

exports.getServiceReview = async (req, res) => {
  try {
    const service = await vendorSchema.findOne({ _id: req.params.id });
    if (!service) {
      return res.status(404).json({ message: "services not found" });
    }
    res.status(200).json({ reviews: service.Reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for updating user profile
// exports.updateProfile = async (req, res) => {
//   try {
//     const updates = req.body;
//     const user = await vendorSchema.findByIdAndUpdate(req.params.id, updates, {
//       new: true,
//     }).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.updateVendorProfile = async (req, res) => {
//   try {
//     const vendorId = req.params.id;
//     const {
//       company_type,
//       company_name,
//       designation,
//       name,
//       mca_panel_member_name,
//       gst_number,
//       pan_number,
//       trand_license,
//       cin_number,
//       moa_number,
//     } = req.body;
//     let vendor = await vendorSchema.findOne({ _id: vendorId });
//     if (!vendor) {
//       return res.status(404).json({
//         status: 404,
//         error: "vendor not found",
//       });
//     }
//     vendor.company_type = company_type || vendor.company_type;
//     vendor.company_name = company_name || vendor.company_name;
//     vendor.designation = designation || vendor.designation;
//     vendor.name = name || vendor.name;
//     vendor.mca_panel_member_name =
//       mca_panel_member_name || vendor.mca_panel_member_name;
//     vendor.gst_number = gst_number || vendor.gst_number;
//     vendor.pan_number = pan_number || vendor.pan_number;
//     vendor.trand_license = trand_license || vendor.trand_license;
//     vendor.cin_number = cin_number || vendor.cin_number;
//     vendor.moa_number = moa_number || vendor.moa_number;

//     let updatedVendor = await vendorSchema.findOneAndUpdate(
//       { _id: vendorId },
//       user,
//       {
//         new: true,
//       }
//     );
//     res.status(200).json({
//       status: true,
//       success: "Details Added",
//       data: updatedVendor,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.addAddress = async (req, res) => {
  try {
    let vendor = await vendorSchema.findOne({ _id: req.params.id });
    if (!vendor) {
      return res.status(404).json({
        status: 404,
        error: "vendor not found",
      });
    }
    let { address } = req.body;

    if (!Array.isArray(address)) {
      address = [address]; // Convert to an array if it's not
    }
    address = address.map((addr) => ({
      ...addr,
      _id: new mongoose.Types.ObjectId(),
    }));

    vendor.address.push(...address);
    await vendor.save();

    res.status(200).json({
      status: true,
      success: "Address saved successfully",
      data: vendor.address,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller for deleting a user
exports.deleteVendorProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.vendorApprove = async (req, res) => {
  try {
    let vendorId = req.params.id;
    let findVendor = await vendorSchema.findOne({ _id: vendorId });
    if (!findVendor) {
      console.log("vendor not found");
      return res.status(404).json({ message: "vendor not found" });
    }
    findVendor.is_approved = true;
    await findVendor.save();
    res.status(200).json({
      message: "vendor approved successfully",
      approval_status: findVendor.is_approved,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.vendorDisapprove = async (req, res) => {
  try {
    const { reason_for_disapprove } = req.body;
    let vendorId = req.params.id;
    let findVendor = await vendorSchema.findOne({ _id: vendorId });
    if (!findVendor) {
      console.log("vendor not found");
      return res.status(404).json({ message: "vendor not found" });
    }
    findVendor.is_approved = false;
    findVendor.isActive = false;
    findVendor.reason_for_disapprove = reason_for_disapprove;
    await findVendor.save();
    res.status(200).json({
      message: "vendor disapproved successfully",
      approval_status: findVendor.is_approved,
      reason_for_disapprove: findVendor.reason_for_disapprove,
      isActive: findVendor.isActive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.vendorStatus = async (req, res) => {
  try {
    const vendor_id = req.params.id;
    const findVendor = await vendorSchema.findOne({ _id: vendor_id });

    if (!findVendor) {
      return res
        .status(404)
        .json({ status: false, message: "Service not found" });
    }

    // Toggle the isActive status
    findVendor.isActive = !findVendor.isActive;

    // Save the updated status
    await findVendor.save();

    return res.status(200).json({
      status: true,
      message: `Vendor ${findVendor.isActive ? "Activated" : "Inactivated"}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addCommissions = async (req, res) => {
  try {
    const { commission_percentage, commission_tax } = req.body;
    let vendorId = req.params.id;
    let findVendor = await vendorSchema.findOne({ _id: vendorId });
    if (!findVendor) {
      console.log("vendor not found");
      return res.status(404).json({ message: "vendor not found" });
    }

    findVendor.commission_percentage =
      commission_percentage || findVendor.commission_percentage;
    findVendor.commission_tax = commission_tax || findVendor.commission_tax;

    const newCommission = await vendorSchema.findOneAndUpdate(
      { _id: vendorId },
      findVendor,
      { new: true }
    );

    res.status(200).json({
      message: "Commission added",
      data: newCommission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.editBankDetails = async (req, res) => {
  try {
    const {
      bank_name,
      account_holder_name,
      account_number,
      ifsc_code,
      bank_branch_name,
    } = req.body;
    let vendorId = req.params.id;
    let findVendor = await vendorSchema.findOne({ _id: vendorId });
    if (!findVendor) {
      console.log("vendor not found");
      return res.status(404).json({ message: "vendor not found" });
    }

    findVendor.bank_name = bank_name || findVendor.bank_name;
    findVendor.account_holder_name =
      account_holder_name || findVendor.account_holder_name;

    findVendor.account_number = account_number || findVendor.account_number;
    findVendor.ifsc_code = ifsc_code || findVendor.ifsc_code;
    findVendor.bank_branch_name =
      bank_branch_name || findVendor.bank_branch_name;

    const newUpdate = await vendorSchema.findOneAndUpdate(
      { _id: vendorId },
      findVendor,
      { new: true }
    );

    res.status(200).json({
      message: "Details Edited",
      data: newUpdate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const deletedVendor = await vendorSchema.findOneAndDelete({
      _id: req.params.id,
    });
    if (!deletedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res
      .status(200)
      .json({ message: "Vendor deleted successfully", vendor: deletedVendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await vendorSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999);
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    const existingOtp = await otpSchema.findOne({ email });
    if (existingOtp) {
      existingOtp.otp = otp;
      existingOtp.expiry = expiry;
      await existingOtp.save();
    } else {
      await otpSchema.create({ email, otp, expiry });
    }
    // console.log("otp", otp);

    await sendOTP(email, otp, user.vendor_name);
    return res.status(200).json({ message: "Otp sent to your email", user });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await vendorSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999);
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    const existingOtp = await otpSchema.findOne({ email });
    if (existingOtp) {
      existingOtp.otp = otp;
      existingOtp.expiry = expiry;
      await existingOtp.save();
    } else {
      await otpSchema.create({ email, otp, expiry });
    }
    // console.log("otp", otp);

    await sendOTP(email, otp, user.vendor_name);
    return res.status(200).json({ message: "OTP Resent to email", user });
  } catch (error) {
    console.error("Error in Resent Email OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await otpSchema.findOne({ email, otp });
    if (!record) {
      console.log("Invalid OTP");
      return res.status(400).json({ message: "Incorrect OTP" });
    }
    if (record.expiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    await otpSchema.deleteMany({ email });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find the user by email
    const user = await vendorSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    await sendResetMessage(email, user.username);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};
