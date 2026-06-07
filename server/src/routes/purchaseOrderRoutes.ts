import { Router } from "express";
import {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from "../controllers/purchaseOrderController.js";

const router = Router();

router.get("/", getPurchaseOrders);
router.post("/", createPurchaseOrder);
router.get("/:orderId", getPurchaseOrder);
router.put("/:orderId", updatePurchaseOrder);
router.delete("/:orderId", deletePurchaseOrder);

export default router;
