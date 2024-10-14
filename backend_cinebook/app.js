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
    const { title, overview, voteAverage, tmdbId, genreIds, genres } = req.body; // genres ajoutés
    const userId = req.user.userId; // Utiliser le champ userId du token

    try {
        // Vérifiez et créez les genres si nécessaire avec noms
        const genreRecords = await Promise.all(
            genreIds.map(async (id, index) => {
                // Vérifiez si le genre existe déjà
                let genre = await prisma.genre.findUnique({
                    where: { id: id }, // Rechercher par ID de genre
                });

                // Si le genre n'existe pas, créez-le avec le nom du genre provenant du frontend
                if (!genre) {
                    genre = await prisma.genre.create({
                        data: { id: id, name: genres[index] }, // Utilise le nom correct du genre
                    });
                }
                return genre;
            })
        );

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
                    // Connectez les genres ici
                    genres: {
                        connect: genreRecords.map((genre) => ({ id: genre.id })), // Connectez les genres existants
                    },
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

        res.status(201).json({ message: 'Movie added to user successfully.' });
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

// Endpoint pour supprimer un film
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

// Endpoint pour récupérer les films ajoutés par l'utilisateur
app.get('/api/userMovies', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // Récupérez l'ID de l'utilisateur connecté
        const userMovies = await prisma.userMovie.findMany({
            where: { userId: userId },
            include: {
                movie: {
                    include: {
                        genres: true, // Inclure les genres des films
                    },
                },
            },
        });

        const result = userMovies.map(userMovie => ({
            id: userMovie.movie.id,
            title: userMovie.movie.title,
            tmdbId: userMovie.movie.tmdbId,
            genres: userMovie.movie.genres, // Inclure les genres ici
        }));

        res.json(result); // Retourner les films en JSON
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Server error');
    }
});

// Endpoint pour récuperer les films favoris des utilisateurs si un utilisateur a déjà ajouté un film
app.get('/api/movies', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // Récupérez l'ID de l'utilisateur connecté
        const userMovies = await prisma.userMovie.findMany({
            where: { userId: userId },
            include: { movie: true }, // Inclure les détails du film
        });

        const result = userMovies.map(userMovie => ({
            id: userMovie.movie.id,
            title: userMovie.movie.title,
            tmdbId: userMovie.movie.tmdbId,
        }));

        res.json(result); // Retourner les films en JSON
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Server error');
    }
});


app.get('/api/recommendations', authenticateJWT, async (req, res) => {
    const userId = req.user.userId; // Get the userId from the token

    try {
        // Fetch movies the user has already added along with their genres
        const userMovies = await prisma.userMovie.findMany({
            where: { userId: userId },
            include: {
                movie: {
                    include: {
                        genres: true, // Include genres of the movies
                    },
                },
            },
        });

        // Extract unique genre IDs from the movies the user has added
        const genreIds = [...new Set(userMovies.flatMap(um => {
            if (um.movie && um.movie.genres && um.movie.genres.length > 0) {
                return um.movie.genres.map(g => g.id);
            } else {
                return []; // If the movie has no genres, return an empty array
            }
        }))];

        if (genreIds.length === 0) {
            return res.status(200).json({ recommendations: [] });
        }

        // Find movies from the same genres that the user hasn't added yet
        const recommendedMovies = await prisma.movie.findMany({
            where: {
                AND: [
                    { genres: { some: { id: { in: genreIds } } } }, // Movies belonging to the user's favorite genres
                    { userMovies: { none: { userId: userId } } }, // Exclude movies already added by the user
                ],
            },
            include: {
                genres: true, // Include genres of the recommended movies
            },
        });

        res.status(200).json({ recommendations: recommendedMovies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});




app.get('/api/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});


app._router.stack.forEach((r) => {
    if (r.route) {
        console.log(`${r.route.path} - ${Object.keys(r.route.methods).join(', ')}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
