// transaction

const {
  supplierModel,
  customerModel,
  transactionModel,
  purchaseModel,
  saleModel,
} = require("../models");
const { codeCreator } = require("../utilits/function");

const newTransactionHandler = async (req, resp) => {
  try {
    let customers = await customerModel.find().select("_id name code");
    let suppliers = await supplierModel.find().select("_id name code");

    return resp.json({ customers, suppliers });
  } catch (e) {
    console.log(e.message);
  }
};

const transactionHandler = async (req, resp) => {
  try {
    let transactions = await transactionModel.find({});

    return resp.json({ transactions });
  } catch (e) {
    console.log(e.message);
  }
};

const billHandler = async (req, resp) => {
  try {
    const { code } = req.params;
    if (!code)
      return resp
        .status(400)
        .json({ message: "Code is required", success: false });

    let totalAmount = 0;

    if (code.includes("PO")) {
      const purchase = await purchaseModel
        .findOne({ code })
        .select("totalAmount");

      if (!purchase) {
        return resp.json({ message: "Purchase not found", success: false });
      }

      totalAmount = purchase.totalAmount;
      return resp.json({ totalAmount, success: true });
    }

    if (code.includes("SL")) {
      const sale = await saleModel.findOne({ code }).select("totalAmount");

      if (!sale) {
        return resp.json({ message: "Sale not found", success: false });
      }

      totalAmount = sale.totalAmount;
      return resp.json({ totalAmount });
    }

    return resp.json({ message: "Invalid code", success: false });
  } catch (e) {
    console.log(e.message);
    return resp.json({ message: "Internal server error", success: false });
  }
};

const addTransactionHandler = async (req, resp) => {
  try {
    let {
      transactionType,
      paymentType,
      amount,
      relatedEntity,
      entityId,
      status,
      createdAt,
    } = req.body;

    const code = await codeCreator({ model: transactionModel, codeStr: "TR" });

    const newTransaction = await transactionModel.create({
      code,
      transactionType,
      paymentType,
      amount,
      relatedEntity,
      entityId,
      status,
      createdAt,
    });

    await newTransaction.save();

    return resp.json({
      message: "Transaction added successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const deleteTransactionHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await transactionModel.findByIdAndDelete(id);

    return resp.json({
      message: "transaction deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updateTransactionHandler = async (req, res) => {
  const {
    _id,
    transactionType,
    paymentType,
    amount,
    relatedEntity,
    entityId,
    status,
    createdAt,
    billId,
  } = req.body;

  try {
    if (
      !_id ||
      !transactionType ||
      !paymentType ||
      !amount ||
      !relatedEntity ||
      !entityId ||
      !status ||
      !createdAt
    ) {
      return res.json({ message: "Missing required fields", success: false });
    }

    const existingTransaction = await transactionModel.findById(_id);

    if (!existingTransaction) {
      return res.json({ message: "transaction not found", success: false });
    }

    // save purchase

    if (status === "paid" && billId?.includes("PO")) {
      const purchase = await purchaseModel.findOne({ code: billId });

      if (!purchase) {
        return res.json({ message: "Purchase not found", success: false });
      }

      
      if (purchase.billed) {
        return res.json({
          message: "This bill is already marked as paid.",
          success: false,
        });
      }

  
      if (amount > purchase.totalAmount) {
        return res.json({
          message: "Paid amount cannot exceed total bill amount.",
          success: false,
        });
      }


      purchase.billed = true;
      await purchase.save();
    }

    existingTransaction.transactionType = transactionType;
    existingTransaction.paymentType = paymentType;
    existingTransaction.amount = amount;
    existingTransaction.relatedEntity = relatedEntity;
    existingTransaction.entityId = entityId;
    existingTransaction.status = status;
    existingTransaction.createdAt = createdAt;

    await existingTransaction.save();

    return res.json({
      message: "Transaction updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

module.exports = {
  newTransactionHandler,
  transactionHandler,
  addTransactionHandler,
  deleteTransactionHandler,
  updateTransactionHandler,
  billHandler,
};
