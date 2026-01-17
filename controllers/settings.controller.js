import Settings from "../models/settings.model.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updateData = req.body;
    
    let settings = await Settings.findOne();
    if (settings) {
      settings = await Settings.findOneAndUpdate({}, updateData, { new: true });
    } else {
      settings = await Settings.create(updateData);
    }
    
    res.status(200).json({
      success: true,
      message: "Configurations updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
