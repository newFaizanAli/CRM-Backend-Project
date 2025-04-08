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

const stockSchema = new mongoose.Schema({
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
  price: { type: Number, defualt: true },
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
    enum: ["admin", "user", "manager", "subadmin"],
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

const purchaseOrderSchema = new mongoose.Schema({
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
  isPaid: { type: String },
  createdAt: { type: Date, default: Date.now },
  date: { type: Date, default: Date.now }
});

const customerSchema = new mongoose.Schema({
  code: String,
  name: String,
  email: String,
  phone: String,
  address: String,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  company: String,
});

const salesOrderSchema = new mongoose.Schema({
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

  isPaid: { type: String },
  date: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  code: { type: String },
  transactionType: { type: String, enum: ["payable", "receivable"] },
  amount: Number,

  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "relatedEntity",
  },

  relatedEntity: {
    type: String,
    enum: ["customer", "supplier"],
    required: true,
  },

  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  paymentType: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const payableSchema = new mongoose.Schema({
  code: { type: String },
  method: { type: String },
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "purchase",
    required: true,
  },
  paid: Number,
  tax: Number,
  discount: Number,
  status: { type: String },
  paymentDate: { type: Date, default: Date.now },
});

const receivableSchema = new mongoose.Schema({
  code: { type: String },
  method: { type: String },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sales",
    required: true,
  },
  paid: Number,
  tax: Number,
  discount: Number,
  status: { type: String },
  saleDate: { type: Date, default: Date.now },
});


// CRM

// Lead Schema

const leadSchema = new mongoose.Schema({
  code: String,
  name: String,
  email: { type: String },
  phone: String,
  company: String,
  source: String,
  status: {
    type: String,
    enum: ["new", "contacted", "qualified", "converted"],
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  address: String,
});

// Opportunity Schema (Sales Pipeline)

const dealSchema = new mongoose.Schema({
  code: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
  stage: {
    type: String,
    enum: ["new", "qualified", "proposal-sent", "closed-won", "closed-lost"],
  },
  value: Number,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  expectedCloseDate: Date,
  createdAt: { type: Date, default: Date.now },
});

// project schema

const projectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
    required: true,
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "deal",
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "on-hold", "cancelled"],
    default: "pending",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// task schema

const taskSchema = new mongoose.Schema({
  code: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "overdue"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium", 
  },
  followUps: [
    {
      date: { type: Date, default: Date.now },
      note: { type: String },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  taskType: {
    type: String,
    enum: [
      "general",
      "follow-up",
      "sales",
      "customer-support",
      "lead-qualification",
      "opportunity-management",
      "project-management",
      "administrative",
      "escalation",
      "custom",
    ],
    default: "general",
  },
});


// Interaction Schema (Calls, Emails, Meetings)

const interactionSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
  type: { type: String, enum: ["call", "email", "meeting"] },
  details: String,
  date: { type: Date, default: Date.now },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
});

// 
module.exports = {
  userModel: mongoose.model("users", userSchema),
  categoryModel: mongoose.model("category", categorySchema),
  warehouseModel: mongoose.model("warehouse", warehouseSchema),
  stockModel: mongoose.model("stock", stockSchema),
  supplierModel: mongoose.model("supplier", supplierSchema),
  purchaseModel: mongoose.model("purchase", purchaseOrderSchema),
  customerModel: mongoose.model("customer", customerSchema),
  saleModel: mongoose.model("sales", salesOrderSchema),
  transactionModel: mongoose.model("transaction", transactionSchema),

  leadModel: mongoose.model("lead", leadSchema),
  dealModel: mongoose.model("deal", dealSchema),
  projectModel: mongoose.model("project", projectSchema),
  taskModel: mongoose.model("task", taskSchema),
  interactionModel: mongoose.model("interaction", interactionSchema),
  
  payableModel: mongoose.model("payble", payableSchema), 
  receivableModel: mongoose.model("receivable", receivableSchema), 
  
};
