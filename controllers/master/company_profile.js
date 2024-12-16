const companyProfileSchema = require("../../models/master/company_profile");

exports.addOrUpdateProfile = async (req, res) => {
  try {
    const {
      company_name,
      website_url,
      footer_text,
      corporate_address,
      contact_email,
      contact_phone,
    } = req.body;
    let existingProfile = await companyProfileSchema.findOne();

    if (existingProfile) {
      existingProfile.company_name =
        company_name || existingProfile.company_name;
      existingProfile.contact_phone =
        contact_phone || existingProfile.contact_phone;
      existingProfile.contact_email =
        contact_email || existingProfile.contact_email;
      existingProfile.corporate_address =
        corporate_address || existingProfile.corporate_address;
      existingProfile.website_url = website_url || existingProfile.website_url;
      existingProfile.footer_text = footer_text || existingProfile.footer_text;

      if (req.body.company_logo) {
        existingProfile.company_logo = req.body.company_logo;
      }
      if (req.body.site_favicon) {
        existingProfile.site_favicon = req.body.site_favicon;
      }
      await existingProfile.save();

      return res.status(200).json({
        message: "Profile updated successfully",
        data: existingProfile,
      });
    }

    const newProfile = new companyProfileSchema({
      company_name,
      website_url,
      footer_text,
      corporate_address,
      contact_email,
      contact_phone,
      company_logo: req.body.company_logo,
      site_favicon: req.body.site_favicon,
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

exports.addSocialMediaLink = async (req, res) => {
  try {
    const profileId = req.params.id;
    const { social_media_name, social_media_url } = req.body;
    let findProfile = await companyProfileSchema.findOne({ _id: profileId });
    if (!findProfile) {
      return res.status(404).json({
        status: 404,
        error: "profile not found",
      });
    }
    findProfile.social_media.push({
      social_media_name,
      social_media_url,
    });

    let updatedProfile = await companyProfileSchema.findOneAndUpdate(
      { _id: profileId },
      findProfile,
      {
        new: true,
      }
    );
    res.status(200).json({
      status: true,
      success: "Added",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await companyProfileSchema.findOne();
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

exports.deleteSocialMediaLink = async (req, res) => {
  try {
    const profileId = req.params.id;
    const socialMediaId = req.params.socialMediaId;

    const profile = await companyProfileSchema.findOne({ _id: profileId });
    console.log("profile", profile);

    if (!profile) {
      return res.status(404).json({
        status: 404,
        error: "Profile not found",
      });
    }

    const updatedSocialMedia = profile.social_media.filter(
      (media) => media._id.toString() !== socialMediaId
    );

    if (updatedSocialMedia.length === profile.social_media.length) {
      return res.status(404).json({
        status: 404,
        error: "Social media link not found",
      });
    }

    profile.social_media = updatedSocialMedia;

    await profile.save();

    res.status(200).json({
      status: true,
      success: "Social media link deleted",
      data: profile,
    });
  } catch (error) {
    console.error("Error deleting social media link:", error);
    res.status(500).json({ error: error.message });
  }
};
