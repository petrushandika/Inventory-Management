import { Router } from "express";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";

const router = Router();

router.get("/", getSuppliers);
router.post("/", createSupplier);
router.put("/:supplierId", updateSupplier);
router.delete("/:supplierId", deleteSupplier);

export default router;
