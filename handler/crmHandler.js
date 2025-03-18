const { userModel, leadModel } = require("../models");
const { codeCreator } = require("../utilits/function");

const usersHandler = async (req, resp) => {
  try {
    const id = req.user.userid;

    let users = await userModel.find({ _id: { $nin: id } });

    return resp.json({ users });
  } catch (e) {
    console.log(e.message);
  }
};

const deleteUserHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await userModel.findByIdAndDelete(id);

    return resp.json({
      message: "user deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updateUserHandler = async (req, res) => {
  let { _id, name, email, usertype, password, status } = req.body;

  try {
    if (!_id || !name || !email || !usertype || !status) {
      return res.json({ message: "Missing required fields", success: false });
    }

    const existingUser = await userModel.findById(_id);

    if (!existingUser) {
      return res.json({ message: "user not found", success: false });
    }

    existingUser.name = name;
    existingUser.email = email;
    existingUser.usertype = usertype;
    existingUser.status = status;

    await existingUser.save();

    return res.json({
      message: "User updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

// lead

const newLeadHandler = async (req, resp) => {
  try {
    let users = await userModel.find().select("_id name");

    return resp.json({ users });
  } catch (e) {
    console.log(e.message);
  }
};

const leadHandler = async (req, resp) => {
  try {
    const id = req.user.userid;

    let leads = await leadModel.find({});

    return resp.json({ leads });
  } catch (e) {
    console.log(e.message);
  }
};

const addLeadHandler = async (req, resp) => {
  try {
    let {
      name,
      email,
      phone,
      company,
      source,
      assignedTo,
      status,
      createdAt,
      notes,
    } = req.body;

    const code = await codeCreator({ model: leadModel, codeStr: "LD" });

    const newLead = await leadModel.create({
      code,
      name,
      email,
      phone,
      company,
      source,
      assignedTo,
      status,
      createdAt,
      notes,
    });

    await newLead.save();

    return resp.json({
      message: "Lead added successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const deleteLeadHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await leadModel.findByIdAndDelete(id);

    return resp.json({
      message: "lead deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = {
  usersHandler,
  deleteUserHandler,
  updateUserHandler,

  newLeadHandler,
  leadHandler,
  addLeadHandler,
  deleteLeadHandler,
};
