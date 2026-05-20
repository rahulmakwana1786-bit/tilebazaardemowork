import { Router } from "express";
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  addProduct,
  updateProduct,
  deleteProduct,
  adminGetProducts,
  getUserById,
  adminGetOrderById
} from "../controllers/adminController.js";
import { getAllInquiries } from "../controllers/inquiryController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

// Apply admin protection to all routes in this file
router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);

// Inventory / Products
router.get("/products", adminGetProducts);
router.post("/products", upload.single('image'), addProduct);
router.patch("/products/:id", upload.single('image'), updateProduct);
router.delete("/products/:id", deleteProduct);

// Order Management
router.get("/orders", getAllOrders);
router.get("/orders/:id", adminGetOrderById);
router.patch("/orders/:id", updateOrderStatus);

// Inquiry Management
router.get("/inquiries", getAllInquiries);

// Customer Management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

export default router;
