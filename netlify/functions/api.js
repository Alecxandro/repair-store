import serverless from 'serverless-http'
import { createApp } from '../../server.js'

// Create the Express app
const app = createApp()

// Export the serverless handler
export const handler = serverless(app)