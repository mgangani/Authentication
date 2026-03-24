import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(cookieParser());
await connectDB();

app.use('/api/users', userRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

