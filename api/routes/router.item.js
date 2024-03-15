import express from 'express';
import { addItem, deleteItem, getItem, updateItem } from '../controllers/controller.item.js';
import { verifyToken } from '../utils/verifiyUser.js';

const router = express.Router();

router.post('/add', verifyToken, addItem);
router.get('/get', verifyToken, getItem);
router.delete('/delete/:itemId', verifyToken, deleteItem);
router.put('/update/:itemId', verifyToken, updateItem);

export default router;
