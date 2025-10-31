import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan'
import businessRouter from './routes/businessRoutes.js';
import imageUploadRouter from './routes/uploadRoutes.js';
// import userRouter from './routes/userRoutes.js';
import { toNodeHandler } from 'better-auth/node';
import auth from './lib/auth.js'; // This will now correctly have all process.env variables
import featureRouter from './routes/featureRoutes.js'

const app: Application = express();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://localoco.azurewebsites.net'
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], // allow multiple dev ports
    credentials: true,
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))


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

// frontend will call and wait for this first before running
app.get('/health', async (req, res) => {
    res.status(200).json({
        "server_status": "ok"
    })
});

app.all('/api/auth/{*any}', toNodeHandler(auth)); // handler for better-auth

app.use(businessRouter)
// app.use(userRouter)
app.use(featureRouter)
app.use(imageUploadRouter)

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

export default app