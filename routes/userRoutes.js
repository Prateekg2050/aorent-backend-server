import express from "express";
const router = express.Router();

import {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
} from "../controllers/userControllers.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router.route("/").get(protect, admin, getUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

export default router;
