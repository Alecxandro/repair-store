import express from 'express'
import { createCustomer, getAllCustomers, updateCustomer, getCustomerById, deleteCustomer } from '../controllers/customer.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/create-customer', protect, createCustomer)
router.put('/update-customer', protect, updateCustomer)
router.delete('/delete-customer', protect, deleteCustomer)
router.get('/get-customer/:id', protect, getCustomerById)
router.get('/get-customers', protect, getAllCustomers)


export default router;