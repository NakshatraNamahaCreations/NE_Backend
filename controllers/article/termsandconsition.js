const TermsCondition = require("../../models/article/termsandconsition");

// VENDOR
exports.addTermsCondition = async (req, res) => {
  try {
    const { termsContent } = req.body;

    const updatedTermsCondition = await TermsCondition.findOneAndUpdate(
      {},
      { termsContent },
      { new: true, upsert: true }
    );
    res.status(200).json({
      message: "Terms & Conditions saved successfully",
      data: updatedTermsCondition,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while saving terms" });
  }
};

// Route to retrieve the latest Terms & Conditions content
exports.findTermsCondition = async (req, res) => {
  try {
    const latestTermsCondition = await TermsCondition.findOne().sort({
      createdAt: -1,
    });
    res.status(200).json(latestTermsCondition);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while retrieving terms" });
  }
};
