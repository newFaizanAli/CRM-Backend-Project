const { warehouseModel, categoryModel, stockModel } = require("../models");
const { codeCreator } = require("../utilits/function");
const { codeMiddleNames } = require("../utilits/const");

const addWarehouseHandler = async (req, resp) => {
  try {
    let { area, city } = req.body;

    const newWarehouse = await warehouseModel.create({
      area,
      city,
    });

    await newWarehouse.save();

    return resp.json({ message: "warehouse added successfuly", success: true });
  } catch (e) {
    console.log(e.message);
  }
};

const warehousesHandler = async (req, resp) => {
  try {
    let warehouses = await warehouseModel.find({});

    return resp.json({ warehouses });
  } catch (e) {
    console.log(e.message);
  }
};

const deleteWarehouseHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await warehouseModel.findByIdAndDelete(id);

    return resp.json({
      message: "warehouse deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updateWarehouseHandler = async (req, res) => {
  const { _id, city, area } = req.body;

  try {
    if (!_id || !area || !city) {
      return res.json({ message: "Missing required fields", success: false });
    }

    const existingWarehouse = await warehouseModel.findById(_id);

    if (!existingWarehouse) {
      return res.json({ message: "warehouse not found", success: false });
    }

    existingWarehouse.area = area;
    existingWarehouse.city = city;

    await existingWarehouse.save();

    return res.json({
      message: "Warehouse updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

// category

const categoryHandler = async (req, resp) => {
  try {
    let categories = await categoryModel.find({});

    return resp.json({ categories });
  } catch (e) {
    console.log(e.message);
  }
};

const addCategoryHandler = async (req, resp) => {
  try {
    let { name } = req.body;

    const existingCategory = await categoryModel.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    });

    if (existingCategory) {
      return resp.json({ message: "Category already exists", success: false });
    }

    const c_code = await codeCreator({ model: categoryModel, codeStr: codeMiddleNames['category'] });


    const newCategory = await categoryModel.create({
      code: c_code,
      name,
    });

    await newCategory.save();

    return resp.json({ message: "category added successfuly", success: true });
  } catch (e) {
    console.log(e.message);
  }
};

const deleteCategoryHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);

    return resp.json({
      message: "category deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updateCategoryHandler = async (req, res) => {
  const { _id, code, name } = req.body;

  try {
    if (!_id || !code || !name) {
      return res.json({ message: "Missing required fields", success: false });
    }

    const existingCategory = await categoryModel.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    });

    if (existingCategory) {
      return res.json({ message: "Category already exists", success: false });
    }

    const categorytoUpdate = await categoryModel.findById(_id);

    if (!categorytoUpdate) {
      return res.json({ message: "category not found", success: false });
    }

    categorytoUpdate.name = name;

    await categorytoUpdate.save();

    return res.json({
      message: "Category updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

// products

const newProductHandler = async (req, resp) => {
  try {
    let categories = await categoryModel.find({});
    let warehouses = await warehouseModel.find({});

    return resp.json({ categories, warehouses });
  } catch (e) {
    console.log(e.message);
  }
};

const productsHandler = async (req, resp) => {
  try {
    const products = await stockModel
      .find()
      .populate("warehouse", "area city")
      .populate("category", "name")
      .exec();

    return resp.json({ products });
  } catch (e) {
    console.log(e.message);
  }
};

const addProductHandler = async (req, resp) => {
  try {
    let { productName, sku, category, warehouse, lowStockThreshold } = req.body;

    const existingProduct = await stockModel.findOne({
      productName: { $regex: new RegExp("^" + productName + "$", "i") },
    });

    if (existingProduct) {
      return resp.json({ message: "Product already exists", success: false });
    }

    const c_code = await codeCreator({ model: stockModel, codeStr: codeMiddleNames['product'] });

    const newProduct = await stockModel.create({
      code: c_code,
      productName,
      sku,
      category,
      warehouse,
      lowStockThreshold,
    });

    await newProduct.save();

    return resp.json({ message: "Product added successfuly", success: true });
  } catch (e) {
    console.log(e.message);
  }
};

const deleteProductHandler = async (req, resp) => {
  try {
    const { id } = req.params;
    await stockModel.findByIdAndDelete(id);

    return resp.json({
      message: "Product deleted successfuly",
      success: true,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updateProductHandler = async (req, res) => {
  let { _id, productName, sku, category, warehouse, lowStockThreshold } =
    req.body;

 
  try {

    const producttoUpdate = await stockModel.findById(_id);

    if (!producttoUpdate) {
      return res.json({ message: "product not found", success: false });
    }

    producttoUpdate.productName = productName;
    producttoUpdate.sku = sku;
    producttoUpdate.category = category;
    producttoUpdate.warehouse = warehouse;
    producttoUpdate.lowStockThreshold = lowStockThreshold;

    await producttoUpdate.save();

    return res.json({
      message: "Product updated successfully!",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

module.exports = {
  addWarehouseHandler,
  warehousesHandler,
  deleteWarehouseHandler,
  updateWarehouseHandler,
  addCategoryHandler,
  categoryHandler,
  deleteCategoryHandler,
  updateCategoryHandler,
  newProductHandler,
  productsHandler,
  addProductHandler,
  deleteProductHandler,
  updateProductHandler
};
