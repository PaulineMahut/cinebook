import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import authenticateJWT from './middleware/auth.js';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js'; 
import recommendationRoutes from './routes/recommendationRoutes.js'; 
import userRoutes from './routes/userRoutes.js'; 
import friendRoutes from './routes/friendRoutes.js'; 
import notificationRoutes from './routes/notificationRoutes.js';
import movieListRoutes from './routes/movieListRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import voteRoutes from './routes/voteRoutes.js'; 
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient(); 

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Configuration de multer pour gérer les fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Supprimer les espaces et remplacer les caractères spéciaux du nom du fichier
        const sanitizedFilename = file.originalname
            .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
            .replace(/[^\w.-]/g, ''); // Supprimer les caractères spéciaux

        // Ajouter un nombre aléatoire à la fin du nom du fichier
        const randomSuffix = Math.floor(Math.random() * 10000);
        cb(null, `${Date.now()}-${sanitizedFilename}-${randomSuffix}`);
    },
});

// Filtre pour vérifier le type de fichier
const fileFilter = (req, file, cb) => {
    // Accepter uniquement les fichiers d'image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only image files are allowed.'), false);
    }
};

const upload = multer({ storage, fileFilter });

// Utiliser import.meta.url pour obtenir le répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assurez-vous que le dossier 'uploads' est accessible publiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Utiliser les routes
app.use('/api', authRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', userRoutes);
app.use('/api', friendRoutes);
app.use('/api', notificationRoutes);
app.use('/api', movieListRoutes);
app.use('/api', groupRoutes);
app.use('/api', voteRoutes);
app.use('/api', commentRoutes);

app._router.stack.forEach((r) => {
    if (r.route) {
        console.log(`${r.route.path} - ${Object.keys(r.route.methods).join(', ')}`);
    }
});



export default app;
