// *********************************************************************************
// apiRoutesExpense.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================
let db = require("../models");
const jwtVerifier = require("../config/passport/jwt");
const multer = require("multer");
const AWS = require("aws-sdk");

const upload = multer();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: "us-east-2"
});

const S3_BUCKET = process.env.BUCKET;

// Removes the expense from the Database
const deleteExpense = (id, userId, res) => {
  db.Expense.destroy({
    where: {
      id: id,
      UserId: userId
    }
  })
    .then(function(dbExpense) {
      res.json(dbExpense);
    });
}

// Routes
// =============================================================
module.exports = function(app) {

  // GET route for getting all of the expenses
  app.get("/api/expense/", jwtVerifier.confirmToken, jwtVerifier.verifyToken, function(req, res) {
    db.Category.findAll({
      include: [
      { model: db.Expense, required: false, where: { UserId: req.userId }}
   ]})
      .then(function(dbExpense) {

        // replace key with boolean that says it exists
        dbExpense.forEach(function(item) {
          item.Expenses.forEach(function(expense){
            if(expense.img){
              expense.img = true;
            }
            else
              expense.img = false;
          });
        });

        res.json(dbExpense);
      });
  });

  // POST route for saving a new expense
  app.post("/api/expense", jwtVerifier.confirmToken, jwtVerifier.verifyToken, function(req, res) {
    console.log(req.body);
    db.Expense.create({
      date: req.body.date,
      amount: req.body.amount,
      name: req.body.name,
      UserId: req.userId,
      CategoryId: req.body.categoryId
    })
      .then(function(dbExpense) {
        dbExpense.img = false; // No image exists yet for a just created expense.

        res.status(201).json(dbExpense);
      }).catch(function(err) {
        res.status(502).json({ message: "Internal server error"});
      });
  });

  // DELETE route for deleting expenses
  app.delete("/api/expense/:id", jwtVerifier.confirmToken, jwtVerifier.verifyToken, function(req, res) {
    db.Expense.findOne({ where: {
      id: req.params.id,
      UserId: req.userId
    }}).then(function(dbExpense) {
      if(dbExpense) {

        // Delete the image from S3
        if(dbExpense.img){
          s3.deleteObject({Bucket: S3_BUCKET, Key: dbExpense.img}, function(err, result) {
            if(err) {
              console.log(err);
              return res.status(500).json({ message: "Error deleting expense from database." });
            }

            deleteExpense(req.params.id, req.userId, res);
          });
        }
        else
          deleteExpense(req.params.id, req.userId, res);
      }
      else
        res.status(404).json({ message: "Expense not found." });
    })
    
  });

  // GET route for getting images
  app.get("/api/expense/:id/image", jwtVerifier.confirmToken, jwtVerifier.verifyToken, function(req, res) {
    db.Expense.findOne({
      where: {
        id: req.params.id,
        UserId: req.userId
      }
    }).then(function(dbExpense){
      // Check if expense and expense image exists
      if(dbExpense && dbExpense.img){
        // Pass a signed URL back to the client
        s3.getSignedUrl("getObject", {Bucket: S3_BUCKET, Key: dbExpense.img, Expires: 60 * 3}, function(err, result){
          if(err){
            console.log(err);
            return res.status(500).json({ message: "Error getting image url." });
          }

          res.json(result);
        });
      }
      else {
        return res.status(404).json({ message: "Expense not found." });
      }
    }).catch(function(err) {
      console.log(err);
      return res.status(500).json({ message: "Error retrieving expense from database." });
    });
  });

  // POST route for adding images
  app.post("/api/expense/:id/image", jwtVerifier.confirmToken, jwtVerifier.verifyToken, upload.single("image"), function(req, res) {
    // Get the expense we want to add the image to.
    db.Expense.findOne({
      where: {
        id: req.params.id,
        UserId: req.userId
      }
    })
      .then(function(dbExpense){
        if(dbExpense){
          // Create a key
          let key = "user" + req.userId + "/expense" + dbExpense.id + "." + req.file.mimetype.split("/")[1];

          // Upload to S3
          s3.upload({
            Bucket: S3_BUCKET,
            Key: key,
            Body: req.file.buffer
          },
          function(err, result){
            if(err){
              console.log(err);
              return res.status(500).json({ message: "Error in adding image to database." });
            }

            // update the expense with the images key
            db.Expense.update({ img: key }, { where: { id: dbExpense.id}} ).then(function() {
              res.status(200).json({ message: "Image added."});
            }).catch(function(err){
              res.status(500).json({ message: "Error in adding image to database." });
            });

          });
        }
        else{
          res.status(404).json({ message: "Expense not found." });
        }
      })
  });

};
