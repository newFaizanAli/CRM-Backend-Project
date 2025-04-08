const {
  stockModel,
  warehouseModel,
  purchaseModel,
  payableModel,
  supplierModel,
  saleModel,
} = require("../models");
const mongoose = require("mongoose");

const stockDashboard = async (req, resp) => {
  try {
    let products = await stockModel.find({}).select("_id sku code productName");
    let warehouses = await warehouseModel.find({}).select("_id area city");
    const lowStockCount = await stockModel.countDocuments({
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    });

    return resp.json({ products, warehouses, lowStockCount });
  } catch (e) {
    console.log(e.message);
  }
};

const lowstockProduct = async (req, resp) => {
  try {
    const { warehouse } = req.params;

    // Build the base query for low stock items
    const query = {
      $expr: { $lt: ["$quantity", "$lowStockThreshold"] },
    };

    if (warehouse && mongoose.Types.ObjectId.isValid(warehouse)) {
      query.warehouse = new mongoose.Types.ObjectId(warehouse);
    }

    const lowStockProducts = await stockModel
      .find(query)
      .select("code productName sku quantity lowStockThreshold warehouse")
      .populate("warehouse", "name");
    return resp.json({
      success: true,
      lowStockProducts,
    });
  } catch (e) {
    console.error("Error in lowstockProduct:", e.message);
    return resp.status(500).json({
      success: false,
      error: e.message,
    });
  }
};

const warehouseStockValue = async (req, resp) => {
  try {
    const { product } = req.params;

    const pipeline = [];

    // Filter by stock _id if a product ID is provided
    if (product && mongoose.Types.ObjectId.isValid(product)) {
      pipeline.push({
        $match: {
          _id: new mongoose.Types.ObjectId(product),
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "warehouses",
          localField: "warehouse",
          foreignField: "_id",
          as: "warehouseData",
        },
      },
      { $unwind: "$warehouseData" },
      {
        $group: {
          _id: "$warehouseData._id",
          area: { $first: "$warehouseData.area" },
          city: { $first: "$warehouseData.city" },
          value: {
            $sum: {
              $multiply: ["$quantity", "$price"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          area: 1,
          city: 1,
          value: 1,
        },
      },
      { $sort: { value: -1 } }
    );

    const stockValue = await stockModel.aggregate(pipeline);

    return resp.json({ success: true, stockValue });
  } catch (e) {
    console.error("Error in warehouseStockValue:", e.message);
    return resp.json({
      success: false,
      error: e.message,
    });
  }
};

// buying

const buyingDashboard = async (req, resp) => {
  try {
    // other

    const suppliers = await supplierModel.find({}).select("_id name code");

    const currentYear = new Date().getFullYear();
    const today = new Date();

    // Total yearly purchase
    const totalPurchase = await purchaseModel.aggregate([
      {
        $match: {
          status: "Completed",
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ]);

    const totalYearlyPurchase = totalPurchase[0]?.totalAmount || 0;

    // Last week and current week completed orders
    const currentWeekStart = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(currentWeekStart);

    const [result] = await purchaseModel.aggregate([
      {
        $facet: {
          lastWeek: [
            {
              $match: {
                status: "Completed",
                createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd },
              },
            },
            { $group: { _id: null, total: { $sum: 1 } } },
            { $project: { _id: 0, total: 1 } },
          ],

          currentWeek: [
            {
              $match: {
                status: "Completed",
                createdAt: { $gte: currentWeekStart },
              },
            },
            { $group: { _id: null, total: { $sum: 1 } } },
            { $project: { _id: 0, total: 1 } },
          ],
        },
      },
    ]);

    const lastWeekOrders = result?.lastWeek[0]?.total || 0;
    const currentWeekOrders = result?.currentWeek[0]?.total || 0;
    const weekOrders = { lastWeekOrders, currentWeekOrders };

    // Active suppliers by month
    const startOfCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const endOfCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [supplier_result] = await purchaseModel.aggregate([
      {
        $match: {
          status: "Completed",
          createdAt: {
            $gte: startOfLastMonth,
            $lte: endOfCurrentMonth,
          },
        },
      },
      {
        $facet: {
          lastMonth: [
            {
              $match: {
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
              },
            },
            { $group: { _id: "$supplierId" } },
            { $count: "totalSuppliers" },
          ],
          currentMonth: [
            {
              $match: {
                createdAt: {
                  $gte: startOfCurrentMonth,
                  $lte: endOfCurrentMonth,
                },
              },
            },
            { $group: { _id: "$supplierId" } },
            { $count: "totalSuppliers" },
          ],
        },
      },
    ]);

    const lastMonth = supplier_result?.lastMonth?.[0]?.totalSuppliers || 0;
    const currentMonth =
      supplier_result?.currentMonth?.[0]?.totalSuppliers || 0;
    const activeSupplier = { lastMonth, currentMonth };

    return resp.json({
      totalYearlyPurchase,
      weekOrders,
      activeSupplier,
      // other
      suppliers,
    });
  } catch (e) {
    console.log(e.message);
    resp.status(500).json({ error: e.message });
  }
};

const buyingMonthlyPurchase = async (req, resp) => {
  try {
    const { supplier, startDate, endDate } = req.params;

    const start =
      startDate && startDate !== "null"
        ? new Date(startDate)
        : new Date(new Date().getFullYear(), 0, 1); // Default to start of the year
    const end =
      endDate && endDate !== "null"
        ? new Date(endDate)
        : new Date(new Date().getFullYear(), 11, 31, 23, 59, 59); // Default to end of the year

    const match = {
      status: "Completed",
      createdAt: { $gte: start, $lte: end },
    };

    if (supplier && mongoose.Types.ObjectId.isValid(supplier)) {
      match.supplierId = new mongoose.Types.ObjectId(supplier);
    }

    const monthlyPurchases = await purchaseModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalAmount: 1,
        },
      },
      { $sort: { month: 1 } }, // Sort by month
    ]);

    // Fill in months that had no purchases with 0
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalAmount:
        monthlyPurchases.find((m) => m.month === i + 1)?.totalAmount || 0,
    }));

    return resp.json({ monthlyData });
  } catch (e) {
    console.log("Error in buyingMonthlyPurchase:", e.message);
    resp.status(500).json({ error: e.message });
  }
};

const buyingPurchaseAmount = async (req, resp) => {
  try {
    const { supplier, startDate, endDate, status } = req.params;

    // Build date filter conditions dynamically
    const dateFilter = {};

    if (startDate && startDate !== "null") {
      dateFilter.$gte = new Date(startDate);
    }

    if (endDate && endDate !== "null") {
      dateFilter.$lte = new Date(endDate);
    }

    // Prepare the base filter
    const purchaseFilter = {};

    // Handle different status cases
    if (status === "null" || !status) {
      // Default case - same as 'Completed'
      purchaseFilter.status = "Completed";
      purchaseFilter.isPaid = "Complete";
    } else if (status === "Pending") {
      purchaseFilter.status = "Pending";
    } else if (status === "toBill") {
      purchaseFilter.$or = [
        { isPaid: { $ne: "Complete" } },
        { isPaid: { $exists: false } },
      ];
    } else if (status === "toRecBill") {
      purchaseFilter.status = "Pending";
      purchaseFilter.$or = [
        { isPaid: { $ne: "Complete" } },
        { isPaid: { $exists: false } },
      ];
    } else if (status === "Completed") {
      purchaseFilter.status = "Completed";
      purchaseFilter.isPaid = "Complete";
    }

    // Add date filter if dates provided
    if (Object.keys(dateFilter).length > 0) {
      purchaseFilter.$and = purchaseFilter.$and || [];
      purchaseFilter.$and.push({
        $or: [{ createdAt: dateFilter }, { date: dateFilter }],
      });
    } else {
      // Default to current year if no dates provided
      const currentYear = new Date().getFullYear();
      purchaseFilter.$and = purchaseFilter.$and || [];
      purchaseFilter.$and.push({
        $or: [
          {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lte: new Date(currentYear, 11, 31, 23, 59, 59),
            },
          },
          {
            date: {
              $gte: new Date(currentYear, 0, 1),
              $lte: new Date(currentYear, 11, 31, 23, 59, 59),
            },
          },
        ],
      });
    }

    if (supplier && mongoose.Types.ObjectId.isValid(supplier)) {
      purchaseFilter.supplierId = new mongoose.Types.ObjectId(supplier);
    }

    // Step 1: Fetch purchases
    const purchases = await purchaseModel.find(purchaseFilter);

    if (!purchases.length) {
      return resp.json({
        totalAmount: 0,
        totalPaid: 0,
        totalWithAdjustments: 0,
        message: "No purchases found for given filter",
      });
    }

    const totalAmount = purchases.reduce(
      (sum, purchase) => sum + (purchase.totalAmount || 0),
      0
    );

    const purchaseIds = purchases.map((p) => p._id);

    // Step 2: Fetch payables (only for statuses that might have payables)
    let payables = [];
    if (
      status === "null" ||
      !status ||
      status === "Completed" ||
      status === "toRecBill"
    ) {
      payables = await payableModel.find({
        purchase: { $in: purchaseIds },
      });
    }

    const totalPaid = payables.reduce((sum, p) => sum + (p.paid || 0), 0);

    // Step 3: Adjustments
    let totalWithAdjustments = 0;
    payables.forEach((p) => {
      const relatedPurchase = purchases.find((pur) =>
        pur._id.equals(p.purchase)
      );
      const amount = relatedPurchase?.totalAmount || 0;
      const tax = (amount * (p.tax || 0)) / 100;
      const discount = (amount * (p.discount || 0)) / 100;
      totalWithAdjustments += amount + tax - discount;
    });

    return resp.json({
      totalAmount,
      totalPaid,
      totalWithAdjustments: Math.round(totalWithAdjustments),
      statusFilter: status || "null (treated as Completed)",
    });
  } catch (e) {
    console.error("Error in buyingPurchaseAmount:", e);
    resp.status(500).json({ error: e.message });
  }
};

const buyingTopSupplier = async (req, resp) => {
  try {
    const { supplier, startDate, endDate } = req.params;

    let matchCondition = { status: "Completed" };

    if (supplier && mongoose.Types.ObjectId.isValid(supplier)) {
      matchCondition.supplierId = new mongoose.Types.ObjectId(supplier);
    }

    if (
      (startDate && startDate !== "null") ||
      (endDate && endDate !== "null")
    ) {
      matchCondition.createdAt = {};

      if (startDate && startDate !== "null") {
        matchCondition.createdAt.$gte = new Date(startDate);
      }

      if (endDate && endDate !== "null") {
        // Make sure to include the whole end date by setting it to the end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchCondition.createdAt.$lte = end;
      }
    }

    const result = await purchaseModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$supplierId",
          totalAmount: { $sum: "$totalAmount" },
          purchaseCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "suppliers",
          localField: "_id",
          foreignField: "_id",
          as: "supplier",
        },
      },
      { $unwind: "$supplier" },
      {
        $project: {
          _id: 0,
          supplierId: "$_id",
          supplierName: "$supplier.name",
          totalAmount: 1,
          purchaseCount: 1,
        },
      },
    ]);

    resp.json(
      result[0] || { success: false, message: "No top supplier found" }
    );
  } catch (e) {
    console.error("Error in buyingTopSupplier:", e.message);
    resp.status(500).json({ error: e.message });
  }
};

// selling

const salesDashboard = async (req, resp) => {
  try {
    // other

    const currentYear = new Date().getFullYear();
    const today = new Date();

    // Total yearly purchase
    const totalSales = await saleModel.aggregate([
      {
        $match: {
          status: "Completed",
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ]);

    const totalYearlySales = totalSales[0]?.totalAmount || 0;

    // Last week and current week completed orders
    const currentWeekStart = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(currentWeekStart);

    const [result] = await saleModel.aggregate([
      {
        $facet: {
          lastWeek: [
            {
              $match: {
                status: "Completed",
                createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd },
              },
            },
            { $group: { _id: null, total: { $sum: 1 } } },
            { $project: { _id: 0, total: 1 } },
          ],

          currentWeek: [
            {
              $match: {
                status: "Completed",
                createdAt: { $gte: currentWeekStart },
              },
            },
            { $group: { _id: null, total: { $sum: 1 } } },
            { $project: { _id: 0, total: 1 } },
          ],
        },
      },
    ]);

    const lastWeekOrders = result?.lastWeek[0]?.total || 0;
    const currentWeekOrders = result?.currentWeek[0]?.total || 0;
    const weekOrders = { lastWeekOrders, currentWeekOrders };

    // Active suppliers by month
    const startOfCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const endOfCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [customer_result] = await saleModel.aggregate([
      {
        $match: {
          status: "Completed",
          createdAt: {
            $gte: startOfLastMonth,
            $lte: endOfCurrentMonth,
          },
        },
      },
      {
        $facet: {
          lastMonth: [
            {
              $match: {
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
              },
            },
            { $group: { _id: "$customerId" } },
            { $count: "totalCustomers" },
          ],
          currentMonth: [
            {
              $match: {
                createdAt: {
                  $gte: startOfCurrentMonth,
                  $lte: endOfCurrentMonth,
                },
              },
            },
            { $group: { _id: "$customerId" } },
            { $count: "totalCustomers" },
          ],
        },
      },
    ]);

    const lastMonth = customer_result?.lastMonth?.[0]?.totalCustomers || 0;
    const currentMonth =
      customer_result?.currentMonth?.[0]?.totalCustomers || 0;
    const activeCustomer = { lastMonth, currentMonth };

    return resp.json({
      totalYearlySales,
      weekOrders,
      activeCustomer,

      // other

      // suppliers,
    });
  } catch (e) {
    console.log(e.message);
    resp.status(500).json({ error: e.message });
  }
};

const salesProformence = async (req, resp) => {
  try {
    const currentYear = new Date().getFullYear();

    // Total yearly purchase

    const totalPurchases = await purchaseModel.aggregate([
      {
        $match: {
          status: "Completed",
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ]);

    const totalYearlyPurchases = totalPurchases[0]?.totalAmount || 0;

    // Total yearly sale

    const totalSales = await saleModel.aggregate([
      {
        $match: {
          status: "Completed",
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ]);

    const totalYearlySales = totalSales[0]?.totalAmount || 0;

    return resp.json({
      totalYearlySales,
      totalYearlyPurchases,
    });
  } catch (e) {
    console.log(e.message);
    resp.status(500).json({ error: e.message });
  }
};

const receivingMonthlySale = async (req, resp) => {
  try {
    const { startDate, endDate } = req.params;

    const start =
      startDate && startDate !== "null"
        ? new Date(startDate)
        : new Date(new Date().getFullYear(), 0, 1); // Default to start of the year
    const end =
      endDate && endDate !== "null"
        ? new Date(endDate)
        : new Date(new Date().getFullYear(), 11, 31, 23, 59, 59); // Default to end of the year

    const match = {
      status: "Completed",
      createdAt: { $gte: start, $lte: end },
    };

   

    const monthlySales = await saleModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalAmount: 1,
        },
      },
      { $sort: { month: 1 } }, 
    ]);

    // Fill in months that had no purchases with 0
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalAmount:
      monthlySales.find((m) => m.month === i + 1)?.totalAmount || 0,
    }));

    return resp.json({ monthlyData });
  } catch (e) {
    console.log("Error in receivingMonthlySale:", e.message);
    resp.status(500).json({ error: e.message });
  }
};
module.exports = {
  stockDashboard,
  buyingDashboard,
  buyingMonthlyPurchase,
  buyingPurchaseAmount,
  buyingTopSupplier,
  lowstockProduct,
  warehouseStockValue,

  salesDashboard,
  salesProformence,
  receivingMonthlySale
};
