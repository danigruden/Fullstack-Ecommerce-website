const express = require("express");
const multer = require("multer");

const checkAuthentication = require("../middleware/check-auth");

const Product = require("../models/product");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

router.post(
  "",
  checkAuthentication,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    if (req.userData.userType !== "admin") {
      return res.status(401).json({
        message: "Authorization failed",
      });
    }
    const product = new Product({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      currentProdPrice: req.body.currentProdPrice,
      beforeDiscountPrice: req.body.beforeDiscountPrice,
      category: req.body.category,
      stock: req.body.stock,
      creator: req.userData.userId,
    });
    product
      .save()
      .then((createdProduct) => {
        res.status(201).json({
          message: "Product added successfully",
          product: {
            ...createdProduct,
            id: createdProduct._id,
          },
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: "Creating a product failed",
        });
      });
  }
);

router.put(
  "/:id",
  checkAuthentication,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    if (req.userData.userType !== "admin") {
      return res.status(401).json({
        message: "Authorization failed",
      });
    }
    let imagePath = req.body.imagePath;
    if (req.file) {
      imagePath = url + "/images/" + req.file.filename;
    }
    const product = new Product({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      currentProdPrice: req.body.currentProdPrice,
      beforeDiscountPrice: req.body.beforeDiscountPrice,
      category: req.body.category,
      stock: req.body.stock,
      creator: req.userData.userId,
    });

    Product.updateOne(
      { _id: req.params.id, creator: req.userData.userId },
      product
    )
      .then((result) => {
        if (result.n > 0) {
          res.status(200).json({ message: "Update successful!" });
        } else {
          return res.status(401).json({
            message: "Authorization failed",
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Updating product failed",
        });
      });
  }
);

router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;

  var query = {};
  if (
    req.query.category !== null &&
    req.query.category !== "null" &&
    req.query.category !== undefined
  ) {
    query["category"] = req.query.category;
  }
  if (req.query.keywordSearch !== "") {
    query["title"] = {
      $regex: ".*" + req.query.keywordSearch + ".*",
      $options: "<i>",
    };
  }

  if (req.query.priceSearchMax == "null") {
    query["currentProdPrice"] = { $gt: Number(req.query.priceSearchMin) };
  } else {
    query["currentProdPrice"] = {
      $gt: Number(req.query.priceSearchMin),
      $lte: Number(req.query.priceSearchMax),
    };
  }

  //{$lte : Number(req.query.priceSearchMin)}
  Product.countDocuments().then(numOfAllProdsQuery => {
    if(numOfAllProdsQuery == 0){
    res.status(201).json({
      message: "No products in database!",
      products: [],
      maxProducts: 0,
      maxPrice: 0,
      minPrice: 0
    });
  }
    Product.find()
      .sort({ currentProdPrice: "desc" })
      .exec(function (err, response) {
        maxPrice = response[0].currentProdPrice;
        minPrice = response[numOfAllProdsQuery - 1].currentProdPrice;
      });
  });

  const productQuery = Product.find(query);
  let fetchedProducts;
  if (pageSize && currentPage) {
    productQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  productQuery
    .then((documents) => {
      fetchedProducts = documents;
      return Product.countDocuments(query);
    })
    .then((count) => {
      res.status(200).json({
        message: "Products fetched successfully!",
        products: fetchedProducts,
        maxProducts: count,
        maxPrice: maxPrice,
        minPrice: minPrice
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching products failed",
      });
    });
});

router.get("/:id", (req, res, next) => {
  Product.findById(req.params.id)
    .then((product) => {
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ message: "Product not found!" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching a product failed",
      });
    });
});

router.get("/prices/idList", (req, res, next) => {
  let fetchedProducts;
  Product.find({ _id: req.query.id })
    .then((documents) => {
      fetchedProducts = documents;
    })
    .then((count) => {
      res.status(200).json({
        message: "Products fetched successfully!",
        documents: fetchedProducts,
      });
    });
});

router.delete("/:id", checkAuthentication, (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  if (req.userData.userType !== "admin") {
    return res.status(401).json({
      message: "Authorization failed",
    });
  }
  Product.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        return res.status(401).json({
          message: "Authorization failed",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Deleting a product failed",
      });
    });
});

module.exports = router;
