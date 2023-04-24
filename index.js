const express = require("express");
const app = express();
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoute");
const userRoutes = require("./routes/userRoute");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error");
const orderRoutes = require("./routes/orderRoute");

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", productRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", orderRoutes);
app.use(errorMiddleware);

mongoose
  .connect(
    "mongodb+srv://user123:pass123Aneesh@cluster0.abti8qv.mongodb.net/test"
  )
  .then(() => {
    console.log("DB connected!");
  });

const server = app.listen(3000, () => {
  console.log("server listening on port!");
});

//unhandled promise rejection

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
