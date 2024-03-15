import express from 'express';
import { createUser, deleteUser, getUsers, updateUser } from '../controllers/controller.user.js';
import { verifyToken } from '../utils/verifiyUser.js';

const router = express.Router();

router.get('/getUsers', verifyToken, getUsers);
router.post('/createUser', verifyToken, createUser);
router.put('/updateUser/:userId', verifyToken, updateUser);
router.delete('/deleteUser/:userId', verifyToken, deleteUser);

export default router;
