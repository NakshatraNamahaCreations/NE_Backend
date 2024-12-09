const payoutConfigSchema = require("../../models/master/payout_config");

exports.addOrUpdatePayoutConfig = async (req, res) => {
  try {
    const {
      company_gst,
      company_cin,
      company_pan,
      company_saccode,
      razorpay_percentage,
      tds_percentage,
      terms_and_conditions,
    } = req.body;

    let existingProfile = await payoutConfigSchema.findOne();

    if (existingProfile) {
      existingProfile.company_gst = company_gst || existingProfile.company_gst;
      existingProfile.company_cin = company_cin || existingProfile.company_cin;
      existingProfile.company_pan = company_pan || existingProfile.company_pan;
      existingProfile.company_saccode =
        company_saccode || existingProfile.company_saccode;
      existingProfile.razorpay_percentage =
        razorpay_percentage || existingProfile.razorpay_percentage;
      existingProfile.tds_percentage =
        tds_percentage || existingProfile.tds_percentage;
      existingProfile.terms_and_conditions =
        terms_and_conditions || existingProfile.terms_and_conditions;

      await existingProfile.save();

      return res.status(200).json({
        message: "Config updated successfully",
        data: existingProfile,
      });
    }

    const newProfile = new payoutConfigSchema({
      company_gst,
      company_cin,
      company_pan,
      company_saccode,
      razorpay_percentage,
      tds_percentage,
      terms_and_conditions,
    });

    await newProfile.save();
    res.status(200).json({
      message: "Added",
      data: newProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPayoutConfig = async (req, res) => {
  try {
    const profile = await payoutConfigSchema.findOne();
    if (!profile) {
      return res.status(404).json({ message: "profile not found" });
    } else {
      res.status(200).json({ profile });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
