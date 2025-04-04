import { Router } from "express";
import { buyFunc, getItemsFunc } from '../controllers/controller';

const router = Router();

router.get("/items", getItemsFunc );
router.post("/buy", buyFunc );

export default router;
