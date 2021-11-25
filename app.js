require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://SparkUser1:qwerty123@cluster0.ajigs.mongodb.net/Bank-Customer?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const customerSchema = new mongoose.Schema({
  name: "String",
  email: "String",
  balance: "Number",
});

const Customer = mongoose.model("customer", customerSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/customers", (req, res) => {
  Customer.find((err, customers) => {
    res.render("index", { customerList: customers });
  });
});

app.post("/", (req, res) => {
  Customer.findById(req.body.viewDetails, (err, customer) => {
    res.render("details", { customerDetail: customer });
  });
});

app.post("/transfer", (req, res) => {
  const sender = req.body.transfer;

  Customer.find((err, customerList) => {
    const recieversId = customerList.filter((element) => {
      return element._id != sender;
    });

    Customer.findById(sender, (err, senderCustomer) => {
      res.render("transfer", {
        senderDetails: senderCustomer,
        recieverList: recieversId,
      });
    });
  });
});
app.post("/finalTransfer", (req, res) => {
  const amountToBeDeducted = Number(req.body.amount);
  const sendersId = req.body.senderId;
  const recieversId = req.body.reciever;

  Customer.findById(sendersId, (err, sender) => {
    if (err) {
      console.log(err);
    } else {
      const sendersBalance = sender.balance;
      const remainingSendersBalance =
        Number(sendersBalance) - Number(amountToBeDeducted);

      if (remainingSendersBalance >= 0) {
        Customer.findById(recieversId, (err, reciever) => {
          const recieversBalance = reciever.balance;
          const totalRecieversBalance =
            Number(recieversBalance) + Number(amountToBeDeducted);
          Customer.findByIdAndUpdate(
            recieversId,
            { balance: totalRecieversBalance },
            (err) => {
              if (err) {
                console.log(err);
              }
            }
          );
        });
        Customer.findByIdAndUpdate(
          sendersId,
          { balance: remainingSendersBalance },
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );

        res.render("result", { contentResult: "Transfer Successful !" });
      } else {
        res.render("failed", {
          contentResult: "Transfer Failed Due To Insufficient Balance !",
        });
      }
    }
  });
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 2000;
}
app.listen(port, () => {
  console.log("Running");
});
