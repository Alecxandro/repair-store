import express from 'express'
import { createRepair, getRepairs } from '../controllers/repair.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/create-repair', protect, createRepair)
router.get('/get-repairs', protect, getRepairs)

export default router;