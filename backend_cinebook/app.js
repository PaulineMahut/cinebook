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
  
  // Endpoint pour supprimer un film de la base de données
  app.delete('/api/movies/:tmdbId', authenticateJWT, async (req, res) => {
    const tmdbId = parseInt(req.params.tmdbId);
    const userId = req.user.id; // Récupérez l'ID de l'utilisateur
  
    try {
      const movie = await prisma.movie.findUnique({
        where: { tmdbId: tmdbId },
      });
  
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
  
      await prisma.movie.delete({
        where: { id: movie.id },
      });
  
      res.status(204).send(); // Renvoie un statut 204 No Content
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to remove movie' });
    }
  });


app.get('/api/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
