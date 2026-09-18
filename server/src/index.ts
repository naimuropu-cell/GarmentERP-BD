import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check & root status
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'GarmentERP BD Backend API',
    timezone: 'Asia/Dhaka',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount Central API Router
app.use('/api/v1', apiRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint [${req.method} ${req.originalUrl}] does not exist.`
    }
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Exception:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred processing your request.'
    }
  });
});

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`🚀 GarmentERP BD Backend Server Running on Port: ${PORT}`);
    console.log(`🇧🇩 Timezone: Asia/Dhaka | Mode: Development`);
    console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    console.log(`========================================================`);
  });
}

export default app;
