// transaction

const { supplierModel, customerModel, transactionModel } = require("../models");
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
   } = req.body;

  try {
 

    if (!_id ||
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
      return res.json({ message: "warehouse not found", success: false });
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
  updateTransactionHandler
};
