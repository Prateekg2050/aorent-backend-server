// packages imports
import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import cors from "cors";
import morgan from "morgan";

// database imports
import connectDb from "./config/db.js";

// middleware imports
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// routes import
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

connectDb();

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/user", userRoutes);
app.use("/product", productRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to AORent server");
});

// Middleware
app.use(notFound);
app.use(errorHandler);

//PORT
const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on ${PORT}`.yellow.bold
  )
);
