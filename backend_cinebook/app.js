import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs'; // Assurez-vous d'utiliser bcryptjs
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; // Importer jsonwebtoken
import authenticateJWT from './middleware/auth.js'; // Importer le middleware
import dotenv from 'dotenv';

dotenv.config(); // Cela charge les variables d'environnement depuis le fichier .env

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API Cinebook');
});

// Endpoint pour l'inscription
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User created', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'User creation failed' });
    }
});

// Endpoint pour la connexion
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Créer le token JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1h', // Le token expire dans une heure
        });

        console.log("Token:", token); // Ajoutez cette ligne pour déboguer
        res.json({ message: 'Login successful', token }); // Retourner le token au client
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/api/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
