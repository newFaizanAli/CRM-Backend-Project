const { supplierModel, stockModel, purchaseModel } = require("../models");
const { codeCreator } = require("../utilits/function");

const addSupplierHandler = async (req, resp) => {
  try {
    let { name, phone, email, address } = req.body;

    const c_code = await codeCreator({ model: supplierModel, codeStr: "SP" });

    const newSupplier = await supplierModel.create({
      code: c_code,
      name,
      phone,
      email,
      address,
    });

    await newSupplier.save();

    return resp.json({ message: "supplier added successfuly", success: true });
  } catch (e) {
    console.log(e.message);
  }
};

const suppliersHandler = async (req, resp) => {
  try {
    let suppliers = await supplierModel.find({});

    return resp.json({ suppliers });
  } catch (e) {
    console.log(e.message);
  }
};

const deleteSupplierHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await supplierModel.findByIdAndDelete(id);

    return resp.json({
      message: "supplier deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updateSupplierHandler = async (req, res) => {
  const { _id, name, address, email, phone } = req.body;

  try {
    if (!_id || !name || !address || !phone || !email) {
      return res.json({ message: "Missing required fields", success: false });
    }

    const existingSupplier = await supplierModel.findById(_id);

    if (!existingSupplier) {
      return res.json({ message: "supplier not found", success: false });
    }

    existingSupplier.name = name;
    existingSupplier.address = address;
    existingSupplier.phone = phone;
    existingSupplier.email = email;

    await existingSupplier.save();

    return res.json({
      message: "Supplier updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

// purchase order

const newPurchaseHandler = async (req, resp) => {
  try {
    let suppliers = await supplierModel.find().select("_id name code");
    let products = await stockModel.find().select("_id productName code sku");

    return resp.json({ suppliers, products });
  } catch (e) {
    console.log(e.message);
  }
};

const purchasesHandler = async (req, resp) => {
  try {
    let purchases = await purchaseModel
      .find()
      .populate("supplierId", "_id name code")
      .populate("items.productId", "_id productName");

    return resp.json({ purchases });
  } catch (e) {
    console.log(e.message);
  }
};

const addPurchaseHandler = async (req, res) => {
  try {
    const { supplierId, items, totalAmount } = req.body;

    if (!supplierId || !items || items.length < 1) {
      return res.json({ message: "Supplier and items are required", success: false });
    }

    const pendingPurchase = await purchaseModel.findOne({
      supplierId,
      status: "pending", 
    });

    if (pendingPurchase) {
      return res.json({
        message: "Supplier has a pending purchase order",
        success: false,
      });
    }

    const invalidItem = items.some(
      (item) => item.quantity < 1 || item.price < 1
    );
    if (invalidItem) {
      return res.json({
        message: "Each item must have a price and quantity greater than 0",
        success: false
      });
    }

    const code = await codeCreator({ model: purchaseModel, codeStr: "PO" });

    const newPurchase = new purchaseModel({
      code: code,
      supplierId,
      items,
      totalAmount,
    });

    await newPurchase.save();
    res.json({ message: "Purchase order created successfully" });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePurchaseHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await purchaseModel.findByIdAndDelete(id);

    return resp.json({
      message: "purchase deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updatePurchaseHandler = async (req, res) => {
  const { _id, supplierId, items, totalAmount } = req.body;

  try {
    if (!_id || !supplierId || !items || !totalAmount) {
      return res.json({ message: "Missing required fields", success: false });
    }

    const existingPurchase = await purchaseModel.findById(_id);

    if (!existingPurchase) {
      return res.json({ message: "purchase not found", success: false });
    }

    existingPurchase.totalAmount = totalAmount;
    existingPurchase.supplierId = supplierId;
    existingPurchase.items = items;

    await existingPurchase.save();

    return res.json({
      message: "Purchase updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

const confirmPurchaseHandler = async (req, res) => {
  const { id } = req.params;

  try {
   
    const existingPurchase = await purchaseModel.findById(id).populate("items.productId");

    if (!existingPurchase) {
      return res.json({ message: "Purchase not found", success: false });
    }

    
    if (existingPurchase.status === "Completed") {
      return res.json({ message: "Purchase is already confirmed", success: false });
    }

   
    for (const item of existingPurchase.items) {
      await stockModel.findByIdAndUpdate(
        item.productId._id,
        { $inc: { quantity: item.quantity } },
        { new: true }
      );
    }

    existingPurchase.status = "Completed";
    await existingPurchase.save();

    return res.json({
      message: "Purchase confirmed successfully and stock updated!",
      success: true,
    });

  } catch (error) {
    console.error("Error confirming purchase:", error);
    return res.json({ message: "Internal server error", success: false });
  }
};

const completedPurchasesHandler = async (req, resp) => {
  try {
    let purchases = await purchaseModel
      .find({ status: "Completed" })
      .populate("supplierId", "_id name code")
      .populate("items.productId", "_id productName");

    return resp.json({ purchases });
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = {
  addSupplierHandler,
  suppliersHandler,
  deleteSupplierHandler,
  updateSupplierHandler,

  newPurchaseHandler,
  purchasesHandler,
  addPurchaseHandler,
  deletePurchaseHandler,
  updatePurchaseHandler,
  confirmPurchaseHandler,
  completedPurchasesHandler
};
