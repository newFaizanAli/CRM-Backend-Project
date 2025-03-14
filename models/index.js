const mongoose = require("mongoose");

// GSStoreProject

mongoose.connect(
  "mongodb+srv://fa7711598:Mx2TxgjwnXUKqUjP@cluster0.yelvvfc.mongodb.net/CRMProject"
);

const categorySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const warehouseSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
});

const StockSchema = new mongoose.Schema({
  code: { type: String },
  productName: { type: String, require: true },
  sku: { type: String, require: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  quantity: { type: Number, default: 0 },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "warehouse",
    required: true,
  },
  lowStockThreshold: { type: Number, require: true },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  usertype: {
    type: String,
    enum: ["admin", "user", "manager"],
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    defualt: true,
  },
});

const supplierSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  phone: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

const PurchaseOrderSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "supplier",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stock",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 1 },
    },
  ],
  totalAmount: Number,
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

const CustomerSchema = new mongoose.Schema({
  code: String,
  name: String,
  email: String,
  phone: String,
  address: String,
});

const SalesOrderSchema = new mongoose.Schema({
  code: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stock",
        required: true,
      },
      qtn: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 1 },
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Completed"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const TransactionSchema = new mongoose.Schema({
  code: { type: String },
  transactionType: { type: String, enum: ["payable", "receivable"] },
  amount: Number,

  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "relatedEntity",
  },

  relatedEntity: { type: String, enum: ["customer", "supplier"], required: true },

  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  paymentType: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  userModel: mongoose.model("users", userSchema),
  categoryModel: mongoose.model("category", categorySchema),
  warehouseModel: mongoose.model("warehouse", warehouseSchema),
  stockModel: mongoose.model("stock", StockSchema),
  supplierModel: mongoose.model("supplier", supplierSchema),
  purchaseModel: mongoose.model("purchase", PurchaseOrderSchema),
  customerModel: mongoose.model("customer", CustomerSchema),
  saleModel: mongoose.model("sales", SalesOrderSchema),
  transactionModel: mongoose.model("transaction", TransactionSchema),
};
