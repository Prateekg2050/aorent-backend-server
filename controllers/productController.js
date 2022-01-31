import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import APIFeatures from '../utils/apiFeatures.js';

// @desc        Fetch all products
// @route       GET /products
// @access      Public
const getProducts = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  features.query = features.query.find({ isRented: { $ne: true } });
  const products = await features.query;

  res.json({
    products,
    // page,
    // pages: Math.ceil(count / pageSize),
  });
});

// @desc        Fetch single product by ID
// @route       GET /products/:id
// @access      Public
const getProductById = asyncHandler(async (req, res) => {
  let product = Product.findByIdAndUpdate(
    req.params.id,
    {},
    {
      new: true,
      runValidators: true,
    }
  );

  product = await Product.findByIdAndUpdate(
    { _id: req.params.id },
    { $inc: { counter: 1 } },
    { multi: false }
  );

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc        Delete a product
// @route       DELETE /products/:id
// @access      Private/Admin

// TODO: Check orders before deleting because order will become null after that
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.remove();
    res.json({ message: 'Product Removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc        Create a product
// @route       POST /products
// @access      Private
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    user: req.user._id,
    name: req.body.name,
    brand: req.body.brand,
    category: req.body.category,
    description: req.body.description,
  });

  if (product) await product.save();
  res.status(201).json({ product });
});

// @desc        Update a product
// @route       PUT /products/:id
// @access      Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (product) {
    // to rerun validators on saving
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(400);
    throw new Error('Product not found');
  }
});

// @desc        Create a new review
// @route       POST /products/:id/reviews
// @access      Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ mesage: 'Review Added' });
  } else {
    res.status(400);
    throw new Error('Product not found');
  }
});

// @desc        Get top rated products
// @route       GET /products/top
// @access      Public
const getTopProducts = asyncHandler(async (req, res) => {
  //   const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  const products = await Product.find({}).sort({ counter: -1 }).limit(5);
  res.json(products);
});

export {
  getProductById,
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
};
