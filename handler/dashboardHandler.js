const { stockModel, warehouseModel, purchaseModel } = require("../models");


// const { codeCreator } = require("../utilits/function");


const stockDashboard = async (req, resp) => {
  try {
    let products = await stockModel.countDocuments({});
    let warehouses = await warehouseModel.countDocuments({});

    const lowStockProducts = await stockModel
      .find({ $expr: { $lt: ["$quantity", "$lowStockThreshold"] } })
      .select("code productName sku quantity lowStockThreshold");

    
    

    return resp.json({ products, warehouses, lowStockProducts  });
  } catch (e) {
    console.log(e.message);
  }
};


// buying

const buyingDashboard = async (req, resp) => {
  try {
   

    const currentYear =  new Date().getFullYear();
    const today = new Date();

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

    const totalYearlyPurchase = totalPurchase[0]?.totalAmount || 0


    // last week orders
   
   
     const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
     
    
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

     const weekOrders = {lastWeekOrders, currentWeekOrders }


     // active supplier

     const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
     const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

     const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
     const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
   
     const [supplier_result] = await purchaseModel.aggregate([
      {
        $match: {
          status: "Completed", 
          createdAt: {
            $gte: startOfLastMonth, 
            $lte: endOfCurrentMonth, // Up to the end of current month
          },
        },
      },
      {
        $facet: {
          // Grouping by unique suppliers for last month
          lastMonth: [
            {
              $match: {
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
              },
            },
            { $group: { _id: "$supplierId" } },
            { $count: "totalSuppliers" },
          ],
          // Grouping by unique suppliers for current month
          currentMonth: [
            {
              $match: {
                createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
              },
            },
            { $group: { _id: "$supplierId" } },
            { $count: "totalSuppliers" },
          ],
        },
      },
    ]);

   
    const lastMonth = supplier_result?.lastMonth?.[0]?.totalSuppliers || 0;
    const currentMonth = supplier_result?.currentMonth?.[0]?.totalSuppliers || 0;

    const activeSupplier = { lastMonth, currentMonth };


    return resp.json({ totalYearlyPurchase,  weekOrders, activeSupplier});
  } catch (e) {
    console.log(e.message);
    resp.status(500).json({ error: e.message });
  }
};

const buyingMonthlyPurchase = async (req, resp) => {
  try {
    const { year } = req.params;

    const currentYear = year || new Date().getFullYear();
   
    const monthlyPurchases = await purchaseModel.aggregate([
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

    // monthly purchase

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalAmount:
        monthlyPurchases.find((m) => m.month === i + 1)?.totalAmount || 0,
    }));

   



    return resp.json({ monthlyData });
  } catch (e) {
    console.log(e.message);
    resp.status(500).json({ error: e.message });
  }
};


module.exports = {
  stockDashboard,
  buyingDashboard,
  buyingMonthlyPurchase
};
