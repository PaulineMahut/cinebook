import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import authenticateJWT from './middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient(); // Gardez une seule instance

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Endpoint pour l'inscription
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
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

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/movies/add', authenticateJWT, async (req, res) => {
    const { title, overview, voteAverage, tmdbId } = req.body;
    const userId = req.user.userId; // Utiliser le champ userId du token

    try {
        // Vérifiez si le film existe déjà
        const existingMovie = await prisma.movie.findUnique({
            where: { tmdbId: tmdbId }, // Rechercher par tmdbId
        });

        if (existingMovie) {
            return res.status(400).json({ error: 'Movie already exists in the database' });
        }

        // Ajoutez le film à la base de données
        const movie = await prisma.movie.create({
            data: {
                title,
                overview,
                voteAverage,
                tmdbId,
                userId, // Associez le film à l'utilisateur
            },
        });

        res.status(201).json(movie); // Retournez le film ajouté
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add movie' });
    }
});




app.post('/api/movies', async (req, res) => {
    const { title, overview, posterPath, releaseDate, voteAverage } = req.body;

    try {
        const movie = await prisma.movie.create({
            data: {
                title,
                overview,
                posterPath,
                voteAverage,
            },
        });
        res.status(201).json({ message: 'Movie created', movie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Movie creation failed' });
    }
});


// POST /favorites
app.post('/favorites', authenticateJWT, async (req, res) => {
    console.log('Request Body:', req.body); // Ajoutez cette ligne
    const { movieId } = req.body;
    const userId = req.user.id;

    // Vérifiez que les valeurs sont définies
    if (!userId || !movieId) {
        return res.status(400).json({ message: 'userId and movieId must be provided' });
    }

    try {
        const favorite = await prisma.favorite.create({
            data: {
                userId: userId,
                movieId: movieId,
            },
        });
        res.status(201).json(favorite);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add to favorites' });
    }
});


// DELETE /favorites/:id
app.delete('/favorites/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.favorite.delete({
            where: { id: parseInt(id) }, // Assurez-vous que l'ID est un entier
        });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to remove from favorites' });
    }
});

// GET /favorites
app.get('/favorites', authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId },
        });
        res.json(favorites);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch favorites' });
    }
});

app.get('/api/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
