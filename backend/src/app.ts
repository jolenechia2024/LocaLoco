import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './middleware/logger.js';
import businessRouter from './routes/businessRoutes.js';
// import userRouter from './routes/userRoutes.js';
import { toNodeHandler } from 'better-auth/node';
import auth from './lib/auth.js'; // This will now correctly have all process.env variables
import featureRouter from './routes/featureRoutes.js';

const app: Application = express();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://localoco.azurewebsites.net'
        : 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Add Helmet for CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "http://localhost:3000",
        "http://localhost:5000",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "https://localoco.blob.core.windows.net",
        "https://*.googleapis.com",      // Wildcard for all googleapis subdomains
        "https://*.gstatic.com",          // Wildcard for gstatic subdomains
        "https://maps.googleapis.com",    // Explicit for maps API
        "https://maps.gstatic.com"        // Explicit for map tiles
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "https://maps.googleapis.com"// Add this
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https://cdn.jsdelivr.net",
        "https://localoco.blob.core.windows.net",
        "https://maps.gstatic.com",
        "https://*.googleapis.com",
        "*.google.com",
        "https://*.ggpht.com",
        "https://images.unsplash.com"
    ],
      fontSrc: [
        "'self'", 
        "data:", 
        "https://fonts.gstatic.com"
    ],
    },
  })
);

// __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// resolve and serve compiled frontend directory (Vite builds to root/dist)
const frontendPath = path.resolve(__dirname, '../../dist');
app.use(express.static(frontendPath));

// resolve and serve the uploads directory 
// TODO: create azure storage acc and use bucket to store images instead
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// frontend will call and wait for this first before running
app.get('/health', async (req, res) => {
    res.status(200).json({
        "server_status": "ok"
    })
});

//  handler for better auth
app.all('/api/auth/{*any}', toNodeHandler(auth)); // handler for better-auth


app.use(businessRouter)
// app.use(userRouter)
app.use(featureRouter)

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(logger)

export default app