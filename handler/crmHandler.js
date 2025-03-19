const { userModel, leadModel, customerModel, dealModel } = require("../models");
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
    let leads = await leadModel.find().populate("assignedTo", "_id name");

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

const convertLeadHandler = async (req, res) => {
  try {
    const lead = await leadModel.findById(req.params.id);
    if (!lead) return res.json({ success: false, message: "Lead not found" });

    const existingCustomer = await customerModel.findOne({ email: lead.email });
    if (existingCustomer) {
      return res.json({ success: false, message: "Customer already exists" });
    }

    const code = await codeCreator({ model: customerModel, codeStr: "CS" });

    const customer = new customerModel({
      code: code,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: "active",
    });

    await customer.save();
    await leadModel.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Lead converted to Customer" });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

const updateLeadHandler = async (req, res) => {
  let {
    _id,
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

  try {
   

    const existingLead = await leadModel.findById(_id);

    if (!existingLead) {
      return res.json({ message: "lead not found", success: false });
    }

    existingLead.name = name;
    existingLead.email = email;
    existingLead.phone = phone;
    existingLead.company = company;
    existingLead.source = source;
    existingLead.notes = notes;
    existingLead.assignedTo = assignedTo;
    existingLead.status = status;
    existingLead.createdAt = createdAt;

    await existingLead.save();

    return res.json({
      message: "Lead updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

// deal

const newDealHandler = async (req, resp) => {
  try {
    let users = await userModel.find().select("_id name");
    let customers = await customerModel.find().select("_id name code");

    return resp.json({ users, customers });
  } catch (e) {
    console.log(e.message);
  }
};

const dealHandler = async (req, resp) => {
  try {
    let deals = await dealModel
      .find()
      .populate("assignedTo", "_id name")
      .populate("customer", "_id name code");

    return resp.json({ deals });
  } catch (e) {
    console.log(e.message);
  }
};

const addDealHandler = async (req, resp) => {
  try {
    let { assignedTo, stage, createdAt, expectedCloseDate, customer, value } =
      req.body;

    const code = await codeCreator({ model: dealModel, codeStr: "DL" });

    const newDeal = await dealModel.create({
      code,
      assignedTo,
      stage,
      createdAt,
      expectedCloseDate,
      customer,
      value,
    });

    await newDeal.save();

    return resp.json({
      message: "Deal added successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updateDealHandler = async (req, res) => {
  let {
    _id,
    assignedTo,
    stage,
    createdAt,
    expectedCloseDate,
    customer,
    value,
  } = req.body;

  try {
    if (
      !_id ||
      !assignedTo ||
      !stage ||
      !createdAt ||
      !expectedCloseDate ||
      !customer ||
      !value
    ) {
      return res.json({ message: "Missing required fields", success: false });
    }

    const existingDeal = await dealModel.findById(_id);

    if (!existingDeal) {
      return res.json({ message: "deal not found", success: false });
    }

    existingDeal.assignedTo = assignedTo;
    existingDeal.stage = stage;
    existingDeal.createdAt = createdAt;
    existingDeal.expectedCloseDate = expectedCloseDate;
    existingDeal.customer = customer;
    existingDeal.value = value;

    await existingDeal.save();

    return res.json({
      message: "Deal updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

// intrection



module.exports = {
  usersHandler,
  deleteUserHandler,
  updateUserHandler,

  newLeadHandler,
  leadHandler,
  addLeadHandler,
  deleteLeadHandler,
  convertLeadHandler,
  updateLeadHandler,

  newDealHandler,
  dealHandler,
  addDealHandler,
  updateDealHandler,
};
