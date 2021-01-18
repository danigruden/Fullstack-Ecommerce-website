const express = require("express");

const checkAuthentication = require("../middleware/check-auth");

const Product = require("../models/product");
const Order = require("../models/order");

const router = express.Router();

const nodemailer = require("nodemailer");

router.post("", checkAuthentication, (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const productsInOrder = req.body.productsOrdered;
  console.log(productsInOrder);

  var date = new Date();
  // Send Email to customer on creating order
  var arrayItems = "";
  var n;
  for (n in req.body.productsOrdered) {
    arrayItems +=
      "<li>" +
      req.body.productsOrdered[n].title +
      " ( " +
      req.body.productsOrdered[n].quantity +
      " X " +
      req.body.productsOrdered[n].price +
      "€ )" +
      "</li>";
  }
  const output = `<h3>Thank you for your order!</h3><p>You can track order status on your profile <b>${req.userData.email}</b> on our site.</p><b>Products ordered: ${arrayItems}</b><br><b>Order date and time: ${date}</b>`;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "37d7d75cdf8f28",
      pass: "3e351108f08d50",
    },
  });

  // send mail with defined transport object
  let info = transporter.sendMail({
    from: '"testEcommerceSite" <test@test.com>', // sender address
    to: req.userData.email.toString(), // list of receivers
    subject: "Order on Ecommerce site successful", // Subject line
    text: date.toString(), // plain text body
    html: output, // html body
  });

  const order = new Order({
    customerEmail: req.userData.email,
    customerId: req.userData.userId,
    productsOrdered: productsInOrder,
    orderDate: date,
  });
  order
    .save()
    .then((createdOrder) => {
      res.status(201).json({
        message: "Order added successfully",
        order: {
          ...createdOrder,
          id: createdOrder._id,
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Creating an order failed",
      });
    });
});

// Get orders data from one user from database
router.get("/user", checkAuthentication, (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");

  Order.find({ customerId: req.userData.userId })
    .sort({ orderDate: "desc" })
    .then((result) => {
      if (result) {
        res
          .status(200)
          .json({ message: "Getting orders successful!", ordersData: result });
      } else {
        return res.status(401).json({
          message: "Authorization failed",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Getting orders failed",
      });
    });
});

// Get all orders data from all users from database
router.get("/all", checkAuthentication, (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
if(req.userData.userType !== "admin"){
  return res.status(401).json({
    message: "Access denied",
  });
}
  Order.find()
    .sort({ orderDate: "desc" })
    .then((result) => {
      if (result) {
        res
          .status(200)
          .json({ message: "Getting orders successful!", ordersData: result });
      } else {
        return res.status(401).json({
          message: "Authorization failed",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Getting orders failed",
      });
    });
});

module.exports = router;
