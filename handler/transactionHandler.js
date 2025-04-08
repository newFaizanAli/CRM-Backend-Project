const {
  supplierModel,
  customerModel,
  transactionModel,
  purchaseModel,
  payableModel,
  saleModel,
  receivableModel,
} = require("../models");
const { codeCreator } = require("../utilits/function");
const { codeMiddleNames } = require("../utilits/const");

// transaction

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

// payable

const addPayablePurchaseHandler = async (req, resp) => {
  try {
    let { status, paid, method, paymentDate, purchase, tax, discount } =
      req.body;

    const code = await codeCreator({
      model: payableModel,
      codeStr: codeMiddleNames["payable"],
    });

    // update purchase status isPaid

    const selectedPurchase = await purchaseModel.findById(purchase);
    selectedPurchase.isPaid = status;
    await selectedPurchase.save();

    // add new payable

    const newPayable = await payableModel.create({
      code,
      status,
      paid,
      method,
      paymentDate,
      purchase,
      tax,
      discount,
    });

    await newPayable.save();

    return resp.json({
      message: "Payable added successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const singlePurchaseInvoice = async (req, resp) => {
  try {
    const { invoice } = req.params;

   

    const selectedPurchase = await payableModel.findOne({ purchase: invoice });

    if (selectedPurchase) {
      resp.json({ success: true, data: selectedPurchase });
    } 
  } catch (e) {
    console.log(e.message);
  }
};

const payableHandler = async (req, resp) => {
  try {
    let payables = await payableModel
      .find({})
      .populate("purchase", "code totalAmount status");

    return resp.json({ payables });
  } catch (e) {
    console.log(e.message);
  }
};

const updatePayablePurchaseHandler = async (req, resp) => {
  try {
    let { id, status, paid, method, paymentDate, purchase, tax, discount } =
      req.body;
     

    const existingPayable = await payableModel.findById(id);

    if (!existingPayable) {
      return resp.json({ message: "Payable not found", success: false });
    }

     // update purchase status isPaid

     const selectedPurchase = await purchaseModel.findById(purchase);
     selectedPurchase.isPaid = status;
     await selectedPurchase.save();


     // update payable

     existingPayable.status = status;
     existingPayable.paid = paid;
     existingPayable.method = method;
     existingPayable.paymentDate = paymentDate;
     existingPayable.purchase = purchase;
     existingPayable.tax = tax;
     existingPayable.discount = discount;
 
     await existingPayable.save();
    

    return resp.json({
      message: "Payable update successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const deletePayablePurchaseHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await payableModel.findByIdAndDelete(id);

    return resp.json({
      message: "Payable deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

// receivable

const addReceivableHandler = async (req, resp) => {
  try {

    let { status, paid, method, saleDate, sale, tax, discount } =
      req.body;

    const code = await codeCreator({
      model: payableModel,
      codeStr: codeMiddleNames["receivable"],
    });

    // update receivable status isPaid

    const selectedSale = await saleModel.findById(sale);
    selectedSale.isPaid = status;
    await selectedSale.save();

    // add new receivable

    const newReceivable = await receivableModel.create({
      code,
      status, paid, method, saleDate, sale, tax, discount
    });

    await newReceivable.save();

    return resp.json({
      message: "Receivable added successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const singleReceivableInvoice = async (req, resp) => {
  try {
    const { invoice } = req.params;

   

    const selectedSale = await receivableModel.findOne({ sale: invoice });

    if (selectedSale) {
      resp.json({ success: true, data: selectedSale });
    } 
  } catch (e) {
    console.log(e.message);
  }
};

const receivableHandler = async (req, resp) => {
  try {
    let sales = await receivableModel
      .find({})
      .populate("sale", "code totalAmount status");

    return resp.json({ sales });
  } catch (e) {
    console.log(e.message);
  }
};

const deleteReceivableSaleHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await receivableModel.findByIdAndDelete(id);

    return resp.json({
      message: "Receivable deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updateReceivableSaleHandler = async (req, resp) => {
  try {
    let { id, status, paid, method, saleDate, sale, tax, discount } =
      req.body;
     

    const existingReceivable = await receivableModel.findById(id);

    if (!existingReceivable) {
      return resp.json({ message: "Receivable not found", success: false });
    }

     // update sale status isPaid

     const selectedSale = await saleModel.findById(sale);
     selectedSale.isPaid = status;
     await selectedSale.save();


     // update receivable

     existingReceivable.status = status;
     existingReceivable.paid = paid;
     existingReceivable.method = method;
     existingReceivable.saleDate = saleDate;
     existingReceivable.sale = sale;
     existingReceivable.tax = tax;
     existingReceivable.discount = discount;
 
     await existingReceivable.save();
    

    return resp.json({
      message: "Receivable update successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = {
  newTransactionHandler,
  transactionHandler,
  addTransactionHandler,
  deleteTransactionHandler,
  updateTransactionHandler,

  // payable

  addPayablePurchaseHandler,
  singlePurchaseInvoice,
  payableHandler,
  updatePayablePurchaseHandler,
  deletePayablePurchaseHandler,

  // receivable
  addReceivableHandler,
  singleReceivableInvoice,
  receivableHandler,
  deleteReceivableSaleHandler,
  updateReceivableSaleHandler
};
