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
  createdAt: { type: Date, default: Date.now },
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
    enum: ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"],
    default: "Pending",
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

const taskSchema = new mongoose.Schema({
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
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "opportunityModel",
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
    enum: ["Pending", "In Progress", "Completed", "Overdue"],
    default: "Pending",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium",
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
      "General",
      "Follow-up",
      "Sales",
      "Customer Support",
      "Lead Qualification",
      "Opportunity Management",
      "Project Management",
      "Administrative",
      "Escalation",
      "Custom",
    ],
    default: "General",
  },
});

module.exports = mongoose.model("task", taskSchema);

// Interaction Schema (Calls, Emails, Meetings)

// const interactionSchema = new mongoose.Schema({
//   customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
//   type: { type: String, enum: ["Call", "Email", "Meeting"] },
//   details: String,
//   date: { type: Date, default: Date.now },
//   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
// });

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
};
