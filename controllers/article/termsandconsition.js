const TermsConditionSchema = require("../../models/article/termsandconsition");

// VENDOR
exports.addTermsCondition = async (req, res) => {
  try {
    const { title, description, selected_type } = req.body;

    // Ensure selected_type is not null or undefined
    if (selected_type === null || selected_type === undefined) {
      return res
        .status(400)
        .json({ error: "selected_type cannot be null or undefined" });
    }

    // Ensure title and description are not empty
    // if (!title || !description) {
    //   return res
    //     .status(400)
    //     .json({ error: "Title and description cannot be empty" });
    // }

    const TNC = new TermsConditionSchema({
      title,
      description,
      selected_type,
    });

    await TNC.save();

    res.status(200).json({
      status: true,
      success: "Added",
      data: TNC,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while saving terms" });
  }
};

exports.findUserTermsCondition = async (req, res) => {
  try {
    const userTerms = await TermsConditionSchema.find({
      selected_type: "user",
    });

    if (userTerms.length === 0) {
      return res.status(404).json({ status: false, message: "No terms found" });
    }
    return res.status(200).json(userTerms);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while retrieving terms" });
  }
};

exports.findVendorTermsCondition = async (req, res) => {
  try {
    const vendorTerms = await TermsConditionSchema.find({
      selected_type: "vendor",
    });

    if (vendorTerms.length === 0) {
      return res.status(404).json({ status: false, message: "No terms found" });
    }
    return res.status(200).json(vendorTerms);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while retrieving terms" });
  }
};

exports.updateTermsNCondition = async (req, res) => {
  try {
    const { title, description } = req.body;
    const id = req.params.id;
    const data = await TermsConditionSchema.findOne({ _id: id });
    if (!data) {
      return res.status(404).json({ message: "data not found" });
    }
    data.title = title || data.title;
    data.description = description || data.description;

    let updateData = await TermsConditionSchema.findOneAndUpdate(
      { _id: id },
      data,
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "Details updated successfully",
      status: true,
      data: updateData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTerms = async (req, res) => {
  try {
    const _id = req.params.id;
    const terms = await TermsConditionSchema.findByIdAndDelete(_id);
    if (!terms) {
      return res
        .status(404)
        .json({ status: false, message: "terms not found" });
    }
    return res
      .status(200)
      .send({ status: true, success: "Details deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
