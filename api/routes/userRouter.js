import express from 'express'
import {  updateUser ,deleteUser, signOut, getUser, getUsers, updatePasswordAndPicture } from '../controllers/userController.js'
import verifyUser from '../utils/verifyUser.js'
const router = express.Router()

router.put('/update/:userId',verifyUser,updateUser)  
router.delete('/delete/:userId',verifyUser, deleteUser)
router.post('/signout',  signOut)
router.get('/getusers',verifyUser, getUsers);
router.get('/:userId', getUser);
router.put('/update-password-picture/:userId', verifyUser, updatePasswordAndPicture)
export default router