import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const DEFAULT_COUNT = 50;
const DEFAULT_PASSWORD = "Password123";
const roles = ["employee", "manager", "admin"];

const countArg = Number.parseInt(process.argv[2] || `${DEFAULT_COUNT}`, 10);
const count = Number.isNaN(countArg) || countArg <= 0 ? DEFAULT_COUNT : countArg;

const buildUsers = async (totalUsers) => {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  return Array.from({ length: totalUsers }, (_, index) => {
    const userNumber = index + 1;

    return {
      name: `Test User ${userNumber}`,
      email: `testuser${userNumber}@example.com`,
      password: hashedPassword,
      role: roles[index % roles.length],
      refreshToken: null,
    };
  });
};

const seedUsers = async () => {
  try {
    await connectDB();

    const users = await buildUsers(count);
    const emails = users.map((user) => user.email);

    await User.deleteMany({ email: { $in: emails } });
    const insertedUsers = await User.insertMany(users);

    console.log(
      `Inserted ${insertedUsers.length} users. Default password: ${DEFAULT_PASSWORD}`,
    );
  } catch (error) {
    console.error("Failed to seed users:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedUsers();
