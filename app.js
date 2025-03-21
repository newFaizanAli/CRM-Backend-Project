const express = require("express");
const server = express();
const mongoose = require("mongoose");

const {
  signupHandler,
  signinHandler,
  checkAuthHandler,
  signoutHandler,
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
  completedPurchasesHandler,
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
} = require("./handler/sellingHandler");

const {
  newTransactionHandler,
  addTransactionHandler,
  transactionHandler,
  deleteTransactionHandler,
  updateTransactionHandler,
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
    origin: ["https://crm-frontend-project.vercel.app"],
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
const { usersHandler, deleteUserHandler, updateUserHandler, newLeadHandler, leadHandler, addLeadHandler, deleteLeadHandler, convertLeadHandler, newDealHandler, addDealHandler, dealHandler, updateDealHandler, updateLeadHandler, newProjectHandler, projectHandler, addProjectHandler, deleteProjectHandler, deleteDealHandler, updateProjectHandler, newTaskHandler, taskHandler, addTaskHandler, updateTaskHandler } = require("./handler/crmHandler");

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

server.get("/warehouses", authMiddleware, warehousesHandler);

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

server.post("/product/add", authMiddleware, addProductHandler);

server.delete("/product/:id", authMiddleware, deleteProductHandler);

server.put("/product", authMiddleware, updateProductHandler);

// supplier

server.get("/suppliers", authMiddleware, suppliersHandler);

server.post("/supplier/add", authMiddleware, addSupplierHandler);

server.delete("/supplier/:id", authMiddleware, deleteSupplierHandler);

server.put("/supplier", authMiddleware, updateSupplierHandler);

// purchase

server.get("/newpurchase", authMiddleware, newPurchaseHandler);

server.get("/purchases", authMiddleware, purchasesHandler);

server.post("/purchase/add", authMiddleware, addPurchaseHandler);

server.delete("/purchase/:id", authMiddleware, deletePurchaseHandler);

server.put("/purchase", authMiddleware, updatePurchaseHandler);

server.post("/purchase/confirm/:id", authMiddleware, confirmPurchaseHandler);

server.get("/purchases/completed", authMiddleware, completedPurchasesHandler);

// customer

server.post("/customer/add", authMiddleware, addCustomerHandler);

server.get("/customers", authMiddleware, customersHandler);

server.put("/customer", authMiddleware, updateCustomersHandler);

server.delete("/customer/:id", authMiddleware, deleteCustomerHandler);

// selling

server.post("/sale/add", authMiddleware, addSellingHandler);

server.get("/newsale", authMiddleware, newSellingHandler);

server.get("/sales", authMiddleware, salesHandler);

server.delete("/sale/:id", authMiddleware, deleteSaleHandler);

server.put("/sale", authMiddleware, updateSaleHandler);

server.post("/sale/confirm/:id", authMiddleware, confirmSaleHandler);

// transaction

server.get("/newtransaction", authMiddleware, newTransactionHandler);

server.get("/transactions", authMiddleware, transactionHandler);

server.post("/transaction/:id", authMiddleware, addTransactionHandler);

server.delete("/transaction/:id", authMiddleware, deleteTransactionHandler);

server.put("/transaction", authMiddleware, updateTransactionHandler);

// CRM

// user

server.get("/users", authMiddleware, usersHandler);

server.delete("/user/:id", authMiddleware, deleteUserHandler);

server.put("/user", authMiddleware, updateUserHandler);

// leads

server.get("/newleads", authMiddleware, newLeadHandler);

server.get("/leads", authMiddleware, leadHandler);

server.post("/lead", authMiddleware, addLeadHandler);

server.delete("/lead/:id", authMiddleware, deleteLeadHandler);

server.post("/lead/convert/:id", authMiddleware, convertLeadHandler);

server.put("/lead", authMiddleware, updateLeadHandler);


// deals

server.get("/newdeal", authMiddleware, newDealHandler);

server.get("/deals", authMiddleware, dealHandler);

server.post("/deal", authMiddleware, addDealHandler);

server.put("/deal", authMiddleware, updateDealHandler);

server.delete("/deal/:id", authMiddleware, deleteDealHandler);


// project

server.get("/newproject", authMiddleware, newProjectHandler);

server.get("/projects", authMiddleware, projectHandler);

server.post("/project", authMiddleware, addProjectHandler);

server.delete("/project/:id", authMiddleware, deleteProjectHandler);

server.put("/project", authMiddleware, updateProjectHandler);

// task

server.get("/newtask", authMiddleware, newTaskHandler);

server.get("/tasks", authMiddleware, taskHandler);

server.post("/task", authMiddleware, addTaskHandler);
 
server.put("/task", authMiddleware, updateTaskHandler);


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
