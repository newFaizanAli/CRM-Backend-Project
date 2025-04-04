const { customerModel, saleModel, stockModel } = require("../models");
const { codeCreator } = require("../utilits/function");
const { codeMiddleNames } = require("../utilits/const");


const addCustomerHandler = async (req, resp) => {
  try {
    let { name, phone, email, address } = req.body;

    const existingCustomer = await customerModel.findOne({ phone });
    if (existingCustomer) {
      return resp.json({
        message: "Phone number already exists",
        success: false,
      });
    }

    const c_code = await codeCreator({ model: customerModel, codeStr: codeMiddleNames['customer'] });

    const newCustomer = await customerModel.create({
      code: c_code,
      name,
      phone,
      email,
      address,
    });

    await newCustomer.save();

    return resp.json({ message: "Customer added successfuly", success: true });
  } catch (e) {
    console.log(e.message);
  }
};

const customersHandler = async (req, resp) => {
  try {
    let customers = await customerModel.find({});

    return resp.json({ customers });
  } catch (e) {
    console.log(e.message);
  }
};

const updateCustomersHandler = async (req, res) => {
  const { _id, name, phone, email, address, company } = req.body;

  try {
    if (!_id || !name || !phone || !email || !address) {
      return res.json({ message: "Missing required fields", success: false });
    }

    const customertoUpdate = await customerModel.findById(_id);

    if (!customertoUpdate) {
      return res.json({ message: "customer not found", success: false });
    }

    customertoUpdate.name = name;
    customertoUpdate.email = email;
    customertoUpdate.phone = phone;
    customertoUpdate.address = address;
    customertoUpdate.company = company;

    await customertoUpdate.save();

    return res.json({
      message: "Customer updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

const deleteCustomerHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await customerModel.findByIdAndDelete(id);

    return resp.json({
      message: "customer deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

// sellling

const newSellingHandler = async (req, resp) => {
  try {
    let customers = await customerModel.find().select("_id name code");
    let products = await stockModel
      .find()
      .select("_id productName code sku quantity");

    return resp.json({ customers, products });
  } catch (e) {
    console.log(e.message);
  }
};

const salesHandler = async (req, resp) => {
  try {
    let sales = await saleModel
      .find()
      .populate("customerId", "_id name code")
      .populate("items.productId", "_id productName quantity");

    return resp.json({ sales });
  } catch (e) {
    console.log(e.message);
  }
};

const addSellingHandler = async (req, res) => {
  try {
    const { customerId, items, totalAmount } = req.body;

    if (!customerId || !items || items.length < 1) {
      return res.json({
        message: "Customer and items are required",
        success: false,
      });
    }

    const pendingSale = await saleModel.findOne({
      customerId,
      status: "pending",
    });

    if (pendingSale) {
      return res.json({
        message: "Customer has a pending sale order",
        success: false,
      });
    }

    const invalidItem = items.some(
      (item) => item.quantity < 1 || item.price < 1
    );
    if (invalidItem) {
      return res.json({
        message: "Each item must have a price and quantity greater than 0",
        success: false,
      });
    }

    const code = await codeCreator({ model: saleModel, codeStr: codeMiddleNames['sales'] });

    const newSale = new saleModel({
      code: code,
      customerId,
      items,
      totalAmount,
    });

    await newSale.save();

    res.json({ message: "Sale created successfully", success: true });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteSaleHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await saleModel.findByIdAndDelete(id);

    return resp.json({
      message: "sale deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updateSaleHandler = async (req, res) => {
  const { _id, customerId, items, totalAmount } = req.body;

  try {
    if (!_id || !customerId || !items || !totalAmount) {
      return res.json({ message: "Missing required fields", success: false });
    }

    const existingSale = await saleModel.findById(_id);

    if (!existingSale) {
      return res.json({ message: "sale not found", success: false });
    }

    existingSale.totalAmount = totalAmount;
    existingSale.customerId = customerId;
    existingSale.items = items;

    await existingSale.save();

    return res.json({
      message: "Sale updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

const confirmSaleHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const existingSale = await saleModel
      .findById(id)
      .populate("items.productId");

    if (!existingSale) {
      return res.json({ message: "Sale not found", success: false });
    }

    if (existingSale.status === "Completed") {
      return res.json({ message: "Sale is already confirmed", success: false });
    }

    for (const item of existingSale.items) {
      await stockModel.findByIdAndUpdate(
        item.productId._id,
        { $inc: { quantity: -item.qtn } },
        { new: true }
      );
    }

    existingSale.status = "Completed";
    await existingSale.save();

    return res.json({
      message: "Sale confirmed successfully and stock updated!",
      success: true,
    });
  } catch (error) {
    console.error("Error confirming sale:", error);
    return res.json({ message: "Internal server error", success: false });
  }
};

module.exports = {
  addCustomerHandler,
  customersHandler,
  updateCustomersHandler,
  deleteCustomerHandler,

  newSellingHandler,
  addSellingHandler,
  salesHandler,
  deleteSaleHandler,
  updateSaleHandler,
  confirmSaleHandler,
};
