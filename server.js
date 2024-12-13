import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/database.js'
import authRoutes from './routes/auth.routes.js'
import customerRoutes from './routes/customer.routes.js'
import repairRoutes from './routes/repair.routes.js'
import statRoutes from './routes/stats.routes.js'
import errorHandlerMiddleware from './middleware/errorHandler.middleware.js'
import { apiStatus } from './controllers/status.controller.js'

import cors from 'cors'

const PORT = process.env.PORT || 3000
dotenv.config()
const app = express()
connectDB()

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'x-client-key',
      'x-client-token',
      'x-client-secret',
      'Authorization',
    ],
    credentials: true,
  })
)

app.use(express.json())

app.get('/', apiStatus)
app.use('/api/repair/auth', authRoutes)
app.use('/api/repair/customer', customerRoutes)
app.use('/api/repair/repair', repairRoutes)
app.use('/api/repair/stats', statRoutes)

app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
