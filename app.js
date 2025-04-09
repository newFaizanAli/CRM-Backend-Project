const express = require("express");
const server = express();

const {
  signupHandler,
  signinHandler,
  checkAuthHandler,
  signoutHandler,
  userProfile,
  resetPassword,
} = require("./handler/authenticationHandler");

const {
  addWarehouseHandler,
  warehousesHandler,
  deleteWarehouseHandler,
  updateWarehouseHandler,
  addCategoryHandler,
  categoryHandler,
  deleteCategoryHandler,
  updateCategoryHandler,
  newProductHandler,
  addProductHandler,
  productsHandler,
  deleteProductHandler,
  updateProductHandler,
} = require("./handler/stockHandler");

const {
  addSupplierHandler,
  suppliersHandler,
  deleteSupplierHandler,
  updateSupplierHandler,
  newPurchaseHandler,
  addPurchaseHandler,
  purchasesHandler,
  deletePurchaseHandler,
  updatePurchaseHandler,
  confirmPurchaseHandler,
  confirmedPurchasesHandler,
  singlePurchaseHandler,
} = require("./handler/buyingHandler");

const {
  customersHandler,
  addCustomerHandler,
  updateCustomersHandler,
  newSellingHandler,
  addSellingHandler,
  salesHandler,
  deleteSaleHandler,
  updateSaleHandler,
  confirmSaleHandler,
  deleteCustomerHandler,
  singleSaleHandler,
} = require("./handler/sellingHandler");

const {
  newTransactionHandler,
  addTransactionHandler,
  transactionHandler,
  deleteTransactionHandler,
  updateTransactionHandler,
  addPayablePurchaseHandler,
  singlePurchaseInvoice,
  payableHandler,
  updatePayablePurchaseHandler,
  deletePayablePurchaseHandler,
  singleReceivableInvoice,
  addReceivableHandler,
  receivableHandler,
  deleteReceivableSaleHandler,
  updateReceivableSaleHandler,
} = require("./handler/transactionHandler");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const PORT = process.env.PORT || 8000;
// const OTPEXPIRETIME = 300;

const LOCAL_URL = "http://localhost:3000";
const VERCEL_URL = "https://crm-frontend-project.vercel.app";

server.use(express.static("public"));

server.use(
  cors({
    origin: [LOCAL_URL, VERCEL_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    // allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// server.options('*', cors());

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: true }));

const { SECRETKEY } = require("./utilits/const");
const {
  usersHandler,
  deleteUserHandler,
  updateUserHandler,
  newLeadHandler,
  leadHandler,
  addLeadHandler,
  deleteLeadHandler,
  convertLeadHandler,
  newDealHandler,
  addDealHandler,
  dealHandler,
  updateDealHandler,
  updateLeadHandler,
  newProjectHandler,
  projectHandler,
  addProjectHandler,
  deleteProjectHandler,
  deleteDealHandler,
  updateProjectHandler,
  newTaskHandler,
  taskHandler,
  addTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  newInteractionHandler,
  interactionHandler,
  addInteractionHandler,
  deleteInteractionHandler,
  updateInteractionHandler,
} = require("./handler/crmHandler");
const {
  stockDashboard,
  buyingDashboard,
  buyingMonthlyPurchase,
  buyingPurchaseAmount,
  buyingTopSupplier,
  lowstockProduct,
  warehouseStockValue,
  salesDashboard,
  salesProformence,
  salesMonthlySale,
  salesAmount,
  salesTopSupplier,
  accountDashboard,
} = require("./handler/dashboardHandler");

// middleware

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ token: false });
    }
    jwt.verify(token, SECRETKEY, (err, decoded) => {
      if (err) {
        return res.json({ token: false });
      }
      req.user = decoded;
      next();
    });
  } catch (e) {
    console.log(e.message);
  }
};

// authentication

server.get("/check-auth", authMiddleware, checkAuthHandler);

server.post("/signin", signinHandler);

server.post("/signup", signupHandler);

server.get("/signout", authMiddleware, signoutHandler);

// warehouse

server.get("/warehouse", authMiddleware, warehousesHandler);

server.post("/warehouse/add", authMiddleware, addWarehouseHandler);

server.delete("/warehouse/:id", authMiddleware, deleteWarehouseHandler);

server.put("/warehouse", authMiddleware, updateWarehouseHandler);

// category

server.get("/categories", authMiddleware, categoryHandler);

server.post("/category/add", authMiddleware, addCategoryHandler);

server.delete("/category/:id", authMiddleware, deleteCategoryHandler);

server.put("/category/:id", authMiddleware, updateCategoryHandler);

// products

server.get("/products", authMiddleware, productsHandler);

server.get("/newproduct", authMiddleware, newProductHandler);

server.post("/products/add", authMiddleware, addProductHandler);

server.delete("/products/:id", authMiddleware, deleteProductHandler);

server.put("/products", authMiddleware, updateProductHandler);

// supplier

server.get("/supplier", authMiddleware, suppliersHandler);

server.post("/supplier/add", authMiddleware, addSupplierHandler);

server.delete("/supplier/:id", authMiddleware, deleteSupplierHandler);

server.put("/supplier", authMiddleware, updateSupplierHandler);

// purchase

server.get("/purchase/confirmed", authMiddleware, confirmedPurchasesHandler);

server.get("/newpurchase", authMiddleware, newPurchaseHandler);

server.get("/purchase", authMiddleware, purchasesHandler);

server.get("/purchase/:id", authMiddleware, singlePurchaseHandler);

server.post("/purchase/add", authMiddleware, addPurchaseHandler);

server.delete("/purchase/:id", authMiddleware, deletePurchaseHandler);

server.put("/purchase", authMiddleware, updatePurchaseHandler);

server.post("/purchase/confirm/:id", authMiddleware, confirmPurchaseHandler);

// customer

server.post("/customer/add", authMiddleware, addCustomerHandler);

server.get("/customer", authMiddleware, customersHandler);

server.put("/customer", authMiddleware, updateCustomersHandler);

server.delete("/customer/:id", authMiddleware, deleteCustomerHandler);

// selling

server.get("/sale/:id", authMiddleware, singleSaleHandler);

server.post("/sale/add", authMiddleware, addSellingHandler);

server.get("/newsale", authMiddleware, newSellingHandler);

server.get("/sales", authMiddleware, salesHandler);

server.delete("/sale/:id", authMiddleware, deleteSaleHandler);

server.put("/sale", authMiddleware, updateSaleHandler);

server.post("/sale/confirm/:id", authMiddleware, confirmSaleHandler);

// transaction

server.get("/newtransaction", authMiddleware, newTransactionHandler);

server.get("/transaction", authMiddleware, transactionHandler);

server.post("/transaction/:id", authMiddleware, addTransactionHandler);

server.delete("/transaction/:id", authMiddleware, deleteTransactionHandler);

server.put("/transaction", authMiddleware, updateTransactionHandler);

// CRM

// user

server.get("/user", authMiddleware, usersHandler);

server.get("/userprofile", authMiddleware, userProfile);

server.delete("/user/:id", authMiddleware, deleteUserHandler);

server.put("/user", authMiddleware, updateUserHandler);

server.post("/password/reset", authMiddleware, resetPassword);

// leads

server.get("/newleads", authMiddleware, newLeadHandler);

server.get("/lead", authMiddleware, leadHandler);

server.post("/lead", authMiddleware, addLeadHandler);

server.delete("/lead/:id", authMiddleware, deleteLeadHandler);

server.post("/lead/convert/:id", authMiddleware, convertLeadHandler);

server.put("/lead", authMiddleware, updateLeadHandler);

// deals

server.get("/newdeal", authMiddleware, newDealHandler);

server.get("/deal", authMiddleware, dealHandler);

server.post("/deal", authMiddleware, addDealHandler);

server.put("/deal", authMiddleware, updateDealHandler);

server.delete("/deal/:id", authMiddleware, deleteDealHandler);

// project

server.get("/newproject", authMiddleware, newProjectHandler);

server.get("/project", authMiddleware, projectHandler);

server.post("/project", authMiddleware, addProjectHandler);

server.delete("/project/:id", authMiddleware, deleteProjectHandler);

server.put("/project", authMiddleware, updateProjectHandler);

// task

server.get("/newtask", authMiddleware, newTaskHandler);

server.get("/task", authMiddleware, taskHandler);

server.post("/task", authMiddleware, addTaskHandler);

server.delete("/task/:id", authMiddleware, deleteTaskHandler);

server.put("/task", authMiddleware, updateTaskHandler);

// interaction

server.get("/newinteraction", authMiddleware, newInteractionHandler);

server.get("/interaction", authMiddleware, interactionHandler);

server.post("/interaction", authMiddleware, addInteractionHandler);

server.delete("/interaction/:id", authMiddleware, deleteInteractionHandler);

server.put("/interaction", authMiddleware, updateInteractionHandler);

// payable

server.get("/payable/purchase/:invoice", authMiddleware, singlePurchaseInvoice);

server.post("/payable/purchase", authMiddleware, addPayablePurchaseHandler);

server.get("/payable/purchase", authMiddleware, payableHandler);

server.put("/payable/purchase", authMiddleware, updatePayablePurchaseHandler);

server.delete(
  "/payable/purchase/:id",
  authMiddleware,
  deletePayablePurchaseHandler
);

// receivable

server.get(
  "/receivable/sale/:invoice",
  authMiddleware,
  singleReceivableInvoice
);

server.post("/receivable/sale", authMiddleware, addReceivableHandler);

server.get("/receivable/sale", authMiddleware, receivableHandler);

server.delete(
  "/receivable/sale/:id",
  authMiddleware,
  deleteReceivableSaleHandler
);

server.put("/receivable/sale", authMiddleware, updateReceivableSaleHandler);

// dashboard

// stock

server.get("/erp/stock/dashboard", authMiddleware, stockDashboard);

server.get(
  "/erp/stock/dashboard/lowstock/:warehouse?",
  authMiddleware,
  lowstockProduct
);

server.get(
  "/erp/stock/dashboard/stockvalue/:product?",
  authMiddleware,
  warehouseStockValue
);

// buying

server.get(
  "/erp/buying/dashboard/purchase/amount/:supplier?/:startDate?/:endDate?/:status?",
  authMiddleware,
  buyingPurchaseAmount
);

server.get(
  "/erp/buying/dashboard/purchase/supplier/:supplier?/:startDate?/:endDate?",
  authMiddleware,
  buyingTopSupplier
);

server.get("/erp/buying/dashboard", authMiddleware, buyingDashboard);

server.get(
  "/erp/buying/dashboard/purchase/:supplier?/:startDate?/:endDate?",
  authMiddleware,
  buyingMonthlyPurchase
);

// selling

server.get("/erp/selling/dashboard", authMiddleware, salesDashboard);

server.get(
  "/erp/selling/dashboard/performance",
  authMiddleware,
  salesProformence
);

server.get(
  "/erp/selling/dashboard/sales/:startDate?/:endDate?",
  authMiddleware,
  salesMonthlySale
); 
 
server.get(
  "/erp/selling/dashboard/sales/amount/:customer?/:startDate?/:endDate?/:status?",
  authMiddleware,
  salesAmount
);

server.get(
  "/erp/selling/dashboard/sales/customer/:customer?/:startDate?/:endDate?",
  authMiddleware,
  salesTopSupplier
);

// account

server.get("/account/dashboard", authMiddleware, accountDashboard);



// server

server.get("/server", async (req, resp) => {
  try {
    return resp.json({ message: "server run successfuly" });
  } catch (e) {
    console.log(e.message);
  }
});

server.listen(PORT, () => {
  try {
    console.log(`Server running on port ${PORT}`);
  } catch (e) {
    console.log(e.message);
  }
});
