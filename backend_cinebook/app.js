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

        let movieId;

        if (!existingMovie) {
            // Si le film n'existe pas, créez-le
            const movie = await prisma.movie.create({
                data: {
                    title,
                    overview,
                    voteAverage,
                    tmdbId,
                },
            });
            movieId = movie.id; // Obtenez l'ID du nouveau film
        } else {
            movieId = existingMovie.id; // Utilisez l'ID de l'existant
        }

        // Ajoutez l'association dans UserMovie
        await prisma.userMovie.create({
            data: {
                userId: userId,
                movieId: movieId,
            },
        });

        res.status(201).json({ message: 'Movie added to user successfully.' }); // Retournez le message
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add movie' });
    }
});


// Endpoint pour vérifier si un film existe déjà dans la base de données
app.get('/api/movies/:tmdbId', authenticateJWT, async (req, res) => {
    const tmdbId = parseInt(req.params.tmdbId);
    const userId = req.user.id; // Récupérez l'ID de l'utilisateur

    try {
        const movie = await prisma.movie.findUnique({
            where: { tmdbId: tmdbId },
        });

        if (movie) {
            return res.status(200).json(movie); // Le film existe
        }

        res.status(404).json({ error: 'Movie not found' }); // Le film n'existe pas
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve movie' });
    }
});

app.delete('/api/movies/:tmdbId', authenticateJWT, async (req, res) => {
    const tmdbId = parseInt(req.params.tmdbId);
    const userId = req.user.userId; // Récupérez l'ID de l'utilisateur

    try {
        // Vérifiez d'abord si l'association existe
        const userMovie = await prisma.userMovie.findFirst({
            where: {
                userId: userId,
                movie: {
                    tmdbId: tmdbId,
                },
            },
        });

        if (!userMovie) {
            return res.status(404).json({ error: 'Movie not found in user collection' });
        }

        // Supprimez l'association de l'utilisateur avec le film
        await prisma.userMovie.delete({
            where: {
                id: userMovie.id,
            },
        });

        // Ensuite, vérifiez s'il n'y a plus d'associations pour le film avant de le supprimer
        const movie = await prisma.movie.findUnique({
            where: { tmdbId: tmdbId },
        });

        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        // Supprimez le film
        await prisma.movie.delete({
            where: { id: movie.id },
        });

        res.status(204).send(); // Renvoie un statut 204 No Content
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove movie' });
    }
});


// Endpoint pour vérifier si un utilisateur a déjà ajouté un film
app.get('/api/userMovies/:tmdbId', authenticateJWT, async (req, res) => {
    const tmdbId = parseInt(req.params.tmdbId);
    const userId = req.user.userId;

    try {
        const userMovie = await prisma.userMovie.findFirst({
            where: {
                userId: userId,
                movie: {
                    tmdbId: tmdbId,
                },
            },
        });

        if (userMovie) {
            return res.status(200).json({ exists: true }); // Le film est déjà associé à l'utilisateur
        }

        res.status(404).json({ exists: false }); // Le film n'est pas associé à l'utilisateur
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check movie association' });
    }
});


app.get('/api/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
