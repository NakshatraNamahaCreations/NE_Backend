const faqSchema = require("../../models/article/faq");

exports.addFaq = async (req, res) => {
  try {
    const { selected_type, question, answer } = req.body;
    const faq = new faqSchema({
      selected_type,
      question,
      answer,
    });
    await faq.save();
    res.status(200).json({
      status: true,
      success: "Added",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllFaq = async (req, res) => {
  try {
    const faq = await faqSchema.find().sort({ _id: -1 });
    if (faq.length === 0) {
      return res.status(404).json({ message: "faq not found" });
    } else {
      res.status(200).json({ faq: faq });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUserFAQ = async (req, res) => {
  try {
    const faq = await faqSchema
      .find({ selected_type: "user" })
      .sort({ _id: -1 });
    if (faq.length === 0) {
      return res.status(404).json({ message: "faq not found" });
    } else {
      res.status(200).json({ faq: faq });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllVendorFAQ = async (req, res) => {
  try {
    const faq = await faqSchema
      .find({ selected_type: "vendor" })
      .sort({ _id: -1 });
    if (faq.length === 0) {
      return res.status(404).json({ message: "faq not found" });
    } else {
      res.status(200).json({ faq: faq });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faqId = req.params.id;
    const faq = await faqSchema.findOne({ _id: faqId });
    if (!faq) {
      return res.status(404).json({ message: "faq not found" });
    }
    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;

    let updateFaq = await faqSchema.findOneAndUpdate({ _id: faqId }, faq, {
      new: true,
    });
    res.status(200).json({
      message: "Details updated successfully",
      status: true,
      data: updateFaq,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const _id = req.params.id;
    const faq = await faqSchema.findByIdAndDelete(_id);
    if (!faq) {
      return res.status(404).json({ status: false, message: "faq not found" });
    }
    return res
      .status(200)
      .send({ status: true, success: "Details deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFaqStatus = async (req, res) => {
  try {
    const faqId = req.params.id;
    const findFaq = await faqSchema.findOne({ _id: faqId });

    if (!findFaq) {
      return res.status(404).json({ status: false, message: "FAQ not found" });
    }

    // Toggle the isActive status
    findFaq.isActive = !findFaq.isActive;

    // Save the updated status
    await findFaq.save();

    return res.status(200).json({
      status: true,
      message: `FAQ ${findFaq.isActive ? "Activated" : "Inactivated"}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
