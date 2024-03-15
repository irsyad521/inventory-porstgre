import express from 'express';
import { addSuplier, deleteSupplier, getSupplier, updateSupplier } from '../controllers/controller.supplier.js';
import { verifyToken } from '../utils/verifiyUser.js';
const router = express.Router();

router.post('/add', verifyToken, addSuplier);
router.get('/get', verifyToken, getSupplier);
router.delete('/delete/:supplierId', verifyToken, deleteSupplier);
router.put('/update/:supplierId', verifyToken, updateSupplier);

export default router;
