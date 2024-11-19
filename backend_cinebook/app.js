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

dotenv.config();

const app = express();
const prisma = new PrismaClient(); // Gardez une seule instance

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
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage });

// Utiliser import.meta.url pour obtenir le répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assurez-vous que le dossier 'uploads' est accessible publiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

///////////// INSCRIPTION /////////////

// Endpoint pour l'inscription
app.post('/api/register', async (req, res) => {
    const { email, password, role = 'USER' } = req.body;
    const defaultProfilePicture = '/images/user_defaut.png';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                profilePicture: defaultProfilePicture,
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

        const token = jwt.sign(
            { userId: user.id, email: user.email, pseudo: user.pseudo }, // Inclure le pseudo dans le token
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});


///////////// FAVORIS /////////////

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


///////////// RECOMMANDATIONS /////////////

// Endpoint pour récuperer les recommandations de films
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


///////////// UTILISATEURS ///////////

//
app.get('/api/users', authenticateJWT, async (req, res) => {
    const search = req.query.search || '';

    try {
        // Récupérer tous les utilisateurs
        const users = await prisma.user.findMany({
            select: {
                id: true,
                pseudo: true,
                email: true,
                profilePicture: true,
            },
        });

        // Filtrer les utilisateurs en mémoire
        const filteredUsers = users.filter(user => 
            (user.pseudo && user.pseudo.toLowerCase().includes(search.toLowerCase())) || 
            (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
        );

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});


// Endpoint pour récupérer le profil utilisateur avec le nombre d'amis, de listes et de groupes
app.get('/api/user/profile', authenticateJWT, async (req, res) => {
    try {
      const userId = req.user.userId;
  
      // Récupérer les informations de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          pseudo: true,
          role: true,
          profilePicture: true,
          friends: true,
          movieLists: true,
          memberships: true,
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
  
      // Compter le nombre d'amis, de listes et de groupes
      const friendCount = user.friends.length;
      const movieListCount = user.movieLists.length;
      const groupCount = user.memberships.length;
  
      res.status(200).json({
        email: user.email,
        pseudo: user.pseudo,
        profilePicture: user.profilePicture,
        friendCount,
        movieListCount,
        groupCount,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du profil utilisateur' });
    }
  });

// Endpoint pour mettre à jour le profil utilisateur
app.put('/api/user/profile', authenticateJWT, upload.single('profilePicture'), async (req, res) => {
    try {
      const userId = req.user.userId;
      const { pseudo, email, currentProfilePictureUrl } = req.body;
      let profilePicture = currentProfilePictureUrl; // Utilisez l'URL de la photo de profil actuelle par défaut
  
      if (req.file) {
        profilePicture = `/uploads/${req.file.filename}`;
      }
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          pseudo,
          email,
          profilePicture,
        },
      });
  
      console.log('Profil utilisateur mis à jour:', updatedUser);
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil utilisateur:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du profil utilisateur' });
    }
  });
  

// Endpoint pour récupérer le profil utilisateur avec le nombre d'amis
app.get('/api/user/profile/:id', async (req, res) => {
    const userId = parseInt(req.params.id); // Conversion de l'ID en entier
    console.log(`Recherche de l'utilisateur avec l'ID : ${userId}`);

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                email: true, 
                pseudo: true,
                profilePicture: true,
                friends: { // Récupérer la relation d'amitié
                    select: { friendId: true } // Sélectionner uniquement l'ID de l'ami
                }
            }
        });

        if (!user) {
            console.error(`Utilisateur avec l'ID ${userId} non trouvé`);
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const friendCount = user.friends.length; // Compter le nombre d'amis
        console.log(`Utilisateur trouvé : ${user.email}, ${user.pseudo}, Nombre d'amis : ${friendCount}`);
        
        res.json({ 
            email: user.email, 
            pseudo: user.pseudo, 
            profilePicture: user.profilePicture,
            friendCount 
        }); // Renvoie le nombre d'amis avec d'autres informations
    } catch (error) {
        console.error('Erreur lors de la recherche dans la base de données:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


///////////// FRIENDS /////////////

// Endpoint pour envoyer une demande d'ami
app.post('/api/friends/add', authenticateJWT, async (req, res) => {
    const userId = req.user.userId; // L'utilisateur qui envoie la demande
    const { friendId } = req.body; // L'utilisateur à ajouter

    try {
        // Vérifier si l'ami existe
        const friend = await prisma.user.findUnique({
            where: { id: friendId },
        });

        if (!friend) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Vérifier si la relation d'amitié existe déjà
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId: userId, friendId: friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });

        if (existingFriendship) {
            return res.status(400).json({ error: 'Friendship already exists' });
        }

        // Envoyer une notification à l'utilisateur cible
        await prisma.notification.create({
            data: {
                userId: friendId,      // L'utilisateur qui reçoit la notification
                senderId: userId,       // L'utilisateur qui envoie la notification
                type: 'friend_request',  // Type de la notification
            },
        });

        res.status(201).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

// Endpoint pour supprimer un ami
app.delete('/api/friends/remove', authenticateJWT, async (req, res) => {
    const userId = req.user.userId; // ID de l'utilisateur connecté
    const { friendId } = req.body;

    try {
        // Vérifier si l'amitié existe pour cet utilisateur
        const friendship = await prisma.friendship.findFirst({
            where: {
                userId: userId,
                friendId: friendId,
            },
        });

        if (!friendship) {
            return res.status(404).json({ error: 'Cette amitié n\'existe pas' });
        }

        // Supprimer l'amitié dans les deux sens
        await prisma.friendship.deleteMany({
            where: {
                OR: [
                    { userId: userId, friendId: friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });

        res.status(200).json({ message: 'Ami supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'ami:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'ami' });
    }
});

// Endpoint pour récupérer les amis de l'utilisateur connecté
app.get('/api/friends', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
  
    try {
      const friends = await prisma.friendship.findMany({
        where: {
        
                 userId: userId 
          
        },        include: {
          friend: { select: { id: true, email: true } },
        },
      });
  
      const friendList = friends.map(friendship => ({
        id: friendship.friend.id,
        email: friendship.friend.email,
      }));
  
      res.status(200).json(friendList);
    } catch (error) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ error: 'Failed to fetch friends' });
    }
});
  
  
// Endpoint pour récupérer les amis d'un utilisateur spécifique
app.get('/api/friends/:userId', authenticateJWT, async (req, res) => {
    const userId = parseInt(req.params.userId); // Récupérer l'ID de l'utilisateur cible

    try {
        // Trouver les amis de l'utilisateur cible (userId)
        const friends = await prisma.friendship.findMany({
            where: {
              // Modifier la clause where pour vérifier les amis de l'utilisateur cible
                  userId: userId 
                
            },
            include: {
                friend: { select: { id: true, email: true, pseudo: true } }, // Récupérer les détails de l'ami
            },
        });

        const friendList = friends.map(friendship => ({
            id: friendship.friend.id,
            email: friendship.friend.email,
            pseudo: friendship.friend.pseudo,
        }));

        res.status(200).json(friendList);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});


///////////// NOTIFICATIONS /////////////

// Route pour envoyer une notification (demande d'ami, invitation à un groupe ou partage de liste)
app.post('/api/notifications/send', authenticateJWT, async (req, res) => {
    const { recipientId, type, groupId, listId } = req.body;
    const senderId = req.user.userId;

    try {
        if (type === 'group_invitation') {
            // Si c'est une invitation à un groupe, vérifier que le groupe existe et que l'utilisateur est bien le créateur ou un membre autorisé à inviter
            const group = await prisma.group.findUnique({
                where: { id: groupId },
            });

            if (!group) {
                return res.status(404).json({ error: 'Groupe non trouvé' });
            }

            // Vérifier que l'utilisateur a le droit d'envoyer des invitations à ce groupe (créateur ou autre logique que tu veux)
            if (group.creatorId !== senderId) {
                return res.status(403).json({ error: 'Non autorisé à inviter des membres dans ce groupe' });
            }

            // Créer la notification d'invitation à un groupe
            const notification = await prisma.notification.create({
                data: {
                    userId: recipientId,       // L'utilisateur qui reçoit l'invitation
                    senderId: senderId,        // L'utilisateur qui envoie l'invitation
                    type: 'group_invitation',  // Type de la notification
                    groupId: groupId,          // ID du groupe
                },
            });

            return res.status(201).json(notification);
        } else if (type === 'list_shared') {
            // Si c'est un partage de liste, vérifier que la liste et le groupe existent
            const list = await prisma.movieList.findUnique({
                where: { id: listId },
            });

            const group = await prisma.group.findUnique({
                where: { id: groupId },
            });

            if (!list || !group) {
                return res.status(404).json({ error: 'Liste ou groupe non trouvé' });
            }

            // Créer des notifications pour chaque membre du groupe
            const groupMembers = await prisma.groupMembership.findMany({
                where: { groupId },
                select: { userId: true },
            });

            const notifications = groupMembers.map(member => ({
                userId: member.userId,
                senderId: senderId,
                type: 'list_shared',
                status: 'unread',
                groupId: groupId,
                listId: listId,
            }));

            await prisma.notification.createMany({
                data: notifications,
            });

            return res.status(201).json({ message: 'Notifications de partage de liste créées' });
        }

        // Créer la notification pour une demande d'ami (si le type n'est pas une invitation de groupe ou un partage de liste)
        const notification = await prisma.notification.create({
            data: {
                userId: recipientId,         // L'utilisateur qui reçoit la demande
                senderId: senderId,          // L'utilisateur qui envoie la demande
                type: type || 'friend_request', // Type de la notification (par défaut: 'friend_request')
                status: 'pending',           // Assurez-vous que le statut est 'pending'
            },
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification:', error);
        res.status(500).json({ error: 'Impossible d\'envoyer la notification' });
    }
});

// Récupérer les notifications de l'utilisateur
app.get('/api/notifications', authenticateJWT, async (req, res) => {
    const userId = req.user.userId; // Assurez-vous que l'utilisateur est authentifié et que son ID est disponible

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
                OR: [
                    { status: 'pending' },
                    { status: 'unread' },
                    { status: 'accepted' },
                ],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        pseudo: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                list: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        res.status(500).json({ error: 'Échec de la récupération des notifications' });
    }
});

// Répondre à une notification
app.post('/api/notifications/respond', authenticateJWT, async (req, res) => {
    const { notificationId, response } = req.body;
    const userId = req.user.userId;

    try {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
            include: { sender: true } // Assurez-vous d'inclure le sender pour accéder à senderId
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification non trouvée' });
        }

        if (response === 'accepted') {
            if (notification.type === 'friend_request') {
                // Vérifiez si la relation d'ami existe déjà
                const existingFriendship = await prisma.friendship.findFirst({
                    where: {
                        OR: [
                            { userId: userId, friendId: notification.senderId },
                            { userId: notification.senderId, friendId: userId },
                        ],
                    },
                });

                if (!existingFriendship) {
                    // Créer la relation d'amitié
                    await prisma.friendship.create({
                        data: {
                            userId: userId,
                            friendId: notification.senderId,
                        }
                    });
                    await prisma.friendship.create({
                        data: {
                            userId: notification.senderId,
                            friendId: userId,
                        }
                    });
                }

                // Récupérer les pseudos des utilisateurs
                const accepter = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { pseudo: true }
                });

                const sender = await prisma.user.findUnique({
                    where: { id: notification.senderId },
                    select: { pseudo: true }
                });

                // Créer une notification pour indiquer que les utilisateurs sont désormais amis
                await prisma.notification.createMany({
                    data: [
                        {
                            userId: notification.senderId,
                            senderId: userId,
                            type: 'friend_accepted',
                            status: 'unread',
                            message: `Vous êtes maintenant amis avec <a href="/profile/${userId}">${req.user.pseudo}</a>.`
                        },
                        {
                            userId: userId,
                            senderId: notification.senderId,
                            type: 'friend_accepted',
                            status: 'unread',
                            message: `Vous êtes maintenant amis avec <a href="/user/${notification.sender.id}">${notification.sender.pseudo}</a>.`
                        }
                    ]
                });

                // Supprimer la notification de demande d'ami
                await prisma.notification.delete({
                    where: { id: notificationId },
                });

                res.status(200).json({ message: 'Demande d\'ami acceptée', accepter, sender });
            } else if (notification.type === 'group_invitation') {
                // Ajouter l'utilisateur dans le groupe
                await prisma.groupMembership.create({
                    data: {
                        groupId: notification.groupId,
                        userId: userId,
                    },
                });

                // Créer une notification pour indiquer que l'utilisateur a rejoint le groupe
                await prisma.notification.create({
                    data: {
                        userId: notification.senderId,
                        senderId: userId,
                        type: 'user_joined_group',
                        status: 'unread',
                        groupId: notification.groupId,
                        message: `${notification.sender.pseudo} a rejoint le groupe ${notification.group.name}.`
                    }
                });

                // Supprimer la notification d'invitation de groupe
                await prisma.notification.delete({
                    where: { id: notificationId },
                });

                res.status(200).json({ message: 'Invitation au groupe acceptée, membre ajouté au groupe' });
            }
        } else {
            // Supprimer la notification de demande d'ami ou d'invitation de groupe rejetée
            await prisma.notification.delete({
                where: { id: notificationId },
            });

            res.status(200).json({ message: 'Notification rejetée' });
        }
    } catch (error) {
        console.error('Erreur lors de la réponse à la notification:', error);
        res.status(500).json({ error: 'Erreur lors de la réponse à la notification' });
    }
});


///////////// GROUPS /////////////

// Répondre à une invitation de groupe
app.post('/api/groups/:groupId/invitations/respond', authenticateJWT, async (req, res) => {
    const { response } = req.body; // "accepted" ou "rejected"
    const userId = req.user.userId; // ID de l'utilisateur qui répond
    const groupId = parseInt(req.params.groupId);

    try {
        // Récupérer la notification d'invitation au groupe
        const invitation = await prisma.notification.findFirst({
            where: {
                userId: userId,
                groupId: groupId,
                type: 'group_invitation',
                status: 'pending',
            },
            include: {
                sender: true,
                group: true,
            },
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation non trouvée ou déjà traitée' });
        }

        // Traiter la réponse de l'utilisateur
        if (response === 'accepted') {
            // Ajouter l'utilisateur dans le groupe
            await prisma.groupMembership.create({
                data: {
                    groupId: groupId,
                    userId: userId,
                },
            });

            // Créer une notification pour indiquer que l'utilisateur a rejoint le groupe
            await prisma.notification.create({
                data: {
                    userId: userId,
                    senderId: invitation.senderId,
                    type: 'user_joined_group',
                    status: 'unread',
                    groupId: groupId,
                    message: `Vous avez rejoint le groupe <a href="/group/${groupId}">${invitation.group.name}</a>.`,
                }
            });

            // Créer une notification pour indiquer à l'envoyeur que l'utilisateur a accepté l'invitation
            await prisma.notification.create({
                data: {
                    userId: invitation.senderId,
                    senderId: userId,
                    type: 'user_joined_group',
                    status: 'unread',
                    groupId: groupId,
                    message: `${invitation.sender.pseudo} a accepté l'invitation à rejoindre le groupe <a href="/group/${groupId}">${invitation.group.name}</a>.`
                }
            });

            // Supprimer la notification d'invitation de groupe
            await prisma.notification.delete({
                where: { id: invitation.id },
            });

            res.status(200).json({ message: 'Invitation au groupe acceptée, membre ajouté au groupe' });
        } else if (response === 'rejected') {
            // Supprimer la notification d'invitation de groupe rejetée
            await prisma.notification.delete({
                where: { id: invitation.id },
            });

            res.status(200).json({ message: 'Invitation au groupe rejetée' });
        } else {
            res.status(400).json({ error: 'Réponse non valide' });
        }
    } catch (error) {
        console.error('Erreur lors de la réponse à l\'invitation de groupe:', error);
        res.status(500).json({ error: 'Impossible de traiter la réponse' });
    }
});


app.get('/api/user/groups', authenticateJWT, async (req, res) => {
    const userId = req.user.userId; // Assurez-vous que l'utilisateur est authentifié et que son ID est disponible

    try {
        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                pseudo: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json(groups);
    } catch (error) {
        console.error('Error retrieving user groups:', error);
        res.status(500).json({ error: 'Failed to retrieve user groups' });
    }
});

// Endpoint pour créer un groupe avec une photo de couverture
app.post('/api/groups', authenticateJWT, upload.single('coverPhoto'), async (req, res) => {
    const { name, description, members } = req.body;
    const creatorId = req.user.userId; // Assurez-vous que l'utilisateur est authentifié et que son ID est disponible
    let coverPhoto = null;
  
    if (req.file) {
      coverPhoto = `/uploads/${req.file.filename}`;
      console.log('Fichier reçu:', req.file);
    } else {
      console.log('Aucun fichier reçu');
    }
  
    try {
      const parsedMembers = JSON.parse(members); // Analysez les membres en tant que tableau JSON
  
      const group = await prisma.group.create({
        data: {
          name,
          description,
          creatorId,
          coverPhoto,
          members: {
            create: {
              userId: creatorId, // Ajouter le créateur en tant que membre du groupe
            },
          },
        },
      });
  
      // Créez une notification pour chaque membre sélectionné
      const notifications = parsedMembers.map(memberId => ({
        userId: memberId,
        senderId: creatorId,
        type: 'group_invitation',
        status: 'pending',
        groupId: group.id, // Utilisez l'ID du groupe nouvellement créé
      }));
  
      await prisma.notification.createMany({
        data: notifications,
      });
  
      res.status(201).json(group);
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ error: 'Failed to create group' });
    }
  });

app.get('/api/groups/:id', authenticateJWT, async (req, res) => {
    const groupId = parseInt(req.params.id);

    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                pseudo: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json(group);
    } catch (error) {
        console.error('Error retrieving group details:', error);
        res.status(500).json({ error: 'Failed to retrieve group details' });
    }
});

app.put('/api/groups/:groupId/members', authenticateJWT, async (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const { members } = req.body;
    const userId = req.user.userId; // Assurez-vous que l'utilisateur est authentifié et que son ID est disponible

    try {
        // Vérifiez si le groupe existe
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Créez une notification pour chaque membre ajouté
        const notifications = members.map(memberId => ({
            userId: memberId,
            senderId: userId,
            type: 'group_invitation',
            status: 'pending',
            groupId: groupId, // Ajoutez le champ groupId pour la notification
        }));

        const createdNotifications = await prisma.notification.createMany({
            data: notifications,
        });

        console.log('Notifications créées:', createdNotifications);

        res.status(200).json({ message: 'Invitations envoyées' });
    } catch (error) {
        console.error('Error updating group members:', error);
        res.status(500).json({ error: 'Failed to update group members' });
    }
});


///////////// LISTES /////////////

// Endpoint pour créer une liste de films
app.post('/api/movie-lists', authenticateJWT, async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.userId;

    try {
        const movieList = await prisma.movieList.create({
            data: {
                name,
                description,
                userId,
            },
        });

        res.status(201).json(movieList);
    } catch (error) {
        console.error('Error creating movie list:', error);
        res.status(500).json({ error: 'Failed to create movie list' });
    }
});

// Endpoint pour ajouter un film à une liste
app.post('/api/movie-lists/:listId/items', authenticateJWT, async (req, res) => {
    const listId = parseInt(req.params.listId);
    const { title, overview, voteAverage, tmdbId } = req.body;

    try {
        // Ajoutez le film à la liste
        const movieListItem = await prisma.movieListItem.create({
            data: {
                listId,
                title,
                overview,
                voteAverage,
                tmdbId,
            },
        });

        res.status(201).json(movieListItem);
    } catch (error) {
        console.error('Error adding movie to list:', error);
        res.status(500).json({ error: 'Failed to add movie to list' });
    }
});

// Endpoint pour récupérer les listes de films de l'utilisateur
app.get('/api/movie-lists', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    console.log(`Fetching movie lists for user with ID: ${userId}`);

    try {
        const movieLists = await prisma.movieList.findMany({
            where: { userId },
            
        });

        console.log(`Movie lists:`, movieLists);
        res.status(200).json(movieLists);
    } catch (error) {
        console.error('Error retrieving movie lists:', error);
        res.status(500).json({ error: 'Failed to retrieve movie lists' });
    }
});

// Endpoint pour supprimer une liste de films
app.delete('/api/movie-lists/:listId', authenticateJWT, async (req, res) => {
    const listId = parseInt(req.params.listId);
    const userId = req.user.userId;

    try {
        // Vérifiez si la liste existe et si l'utilisateur est le créateur
        const movieList = await prisma.movieList.findUnique({
            where: { id: listId },
            include: { user: true },
        });

        if (!movieList || movieList.userId !== userId) {
            return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer cette liste' });
        }

        // Supprimez la liste (les éléments associés seront supprimés en cascade)
        await prisma.movieList.delete({
            where: { id: listId },
        });

        res.status(204).send(); // Renvoie un statut 204 No Content
    } catch (error) {
        console.error('Erreur lors de la suppression de la liste de films:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la liste de films' });
    }
});

app.delete('/api/movie-lists/:listId/items/:itemId', authenticateJWT, async (req, res) => {
    const listId = parseInt(req.params.listId);
    const itemId = parseInt(req.params.itemId);
    console.log(`Removing movie list item with ID: ${itemId} from list with ID: ${listId}`);

    try {
        const movieListItem = await prisma.movieListItem.delete({
            where: { id: itemId },
        });

        res.status(200).json(movieListItem);
    } catch (error) {
        console.error('Error removing movie from list:', error);
        res.status(500).json({ error: 'Failed to remove movie from list' });
    }
});

// Récupérer les détails d'une liste de films
app.get('/api/movie-lists/:id', authenticateJWT, async (req, res) => {
    const listId = parseInt(req.params.id);
    console.log(`Fetching details for movie list with ID: ${listId}`);

    try {
        const movieList = await prisma.movieList.findUnique({
            where: { id: listId },
            include: {
                user: true, // Inclure l'utilisateur qui a créé la liste
                items: true,
            },
        });

        if (!movieList) {
            console.error(`Movie list with ID ${listId} not found`);
            return res.status(404).json({ error: 'Movie list not found' });
        }

        console.log(`Movie list details:`, movieList);
        res.status(200).json(movieList);
    } catch (error) {
        console.error('Error retrieving movie list details:', error);
        res.status(500).json({ error: 'Failed to retrieve movie list details' });
    }
});

// Partager une liste avec un groupe
app.post('/api/lists/:listId/share', authenticateJWT, async (req, res) => {
    const listId = parseInt(req.params.listId);
    const { groupId } = req.body;
    const userId = req.user.userId;

    if (!groupId) {
        return res.status(400).json({ error: 'groupId est requis' });
    }

    try {
        // Vérifiez si la liste existe et si l'utilisateur est le créateur
        const list = await prisma.movieList.findUnique({
            where: { id: listId },
            include: { user: true },
        });

        if (!list || list.userId !== userId) {
            return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à partager cette liste' });
        }

        // Vérifiez si le groupe existe
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return res.status(404).json({ error: 'Groupe non trouvé' });
        }

        // Partager la liste avec le groupe
        const sharedList = await prisma.sharedList.create({
            data: {
                listId,
                groupId,
            },
        });

        // Créer des notifications pour chaque membre du groupe
        const groupMembers = await prisma.groupMembership.findMany({
            where: { groupId },
            select: { userId: true },
        });

        const notifications = groupMembers.map(member => ({
            userId: member.userId,
            senderId: userId,
            type: 'list_shared',
            status: 'unread',
            groupId: groupId,
            listId: listId,
        }));

        await prisma.notification.createMany({
            data: notifications,
        });

        res.status(201).json(sharedList);
    } catch (error) {
        console.error('Erreur lors du partage de la liste:', error);
        res.status(500).json({ error: 'Impossible de partager la liste' });
    }
});

// Récupérer les listes partagées avec les groupes de l'utilisateur
app.get('/api/user/shared-lists', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Récupérer les groupes auxquels l'utilisateur appartient
        const memberships = await prisma.groupMembership.findMany({
            where: { userId },
            select: { groupId: true },
        });

        const groupIds = memberships.map(membership => membership.groupId);

        // Récupérer les listes partagées avec ces groupes
        const sharedLists = await prisma.sharedList.findMany({
            where: { groupId: { in: groupIds } },
            include: {
                list: {
                    include: {
                        items: true,
                    },
                },
            },
        });

        res.status(200).json(sharedLists);
    } catch (error) {
        console.error('Erreur lors de la récupération des listes partagées:', error);
        res.status(500).json({ error: 'Impossible de récupérer les listes partagées' });
    }
});

// Récupérer les listes partagées avec un groupe
app.get('/api/groups/:groupId/lists', authenticateJWT, async (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const userId = req.user.userId;

    try {
        // Vérifiez si l'utilisateur est membre du groupe
        const membership = await prisma.groupMembership.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: groupId,
                },
            },
        });

        if (!membership) {
            return res.status(403).json({ error: 'Vous n\'êtes pas membre de ce groupe' });
        }

        const sharedLists = await prisma.sharedList.findMany({
            where: { groupId },
            include: {
                list: {
                    include: {
                        items: true,
                    },
                },
            },
        });

        res.status(200).json(sharedLists);
    } catch (error) {
        console.error('Erreur lors de la récupération des listes partagées:', error);
        res.status(500).json({ error: 'Impossible de récupérer les listes partagées' });
    }
});


///////////// VOTES /////////////

// Middleware pour vérifier l'appartenance au groupe
async function checkGroupMembership(req, res, next) {
    const userId = req.user.userId;
    const sessionId = parseInt(req.params.sessionId);

    if (isNaN(sessionId)) {
        return res.status(400).json({ error: 'Invalid session ID' });
    }

    try {
        // Récupérer la session de vote et la liste de films associée
        const votingSession = await prisma.votingSession.findUnique({
            where: { id: sessionId },
            include: {
                movieList: {
                    include: {
                        user: true, // Inclure l'utilisateur qui a créé la liste
                        items: true,
                        sharedLists: {
                            include: {
                                group: {
                                    include: {
                                        members: true
                                    }
                                }
                            }
                        }
                    }
                },
                votes: {
                    include: { user: true, movieListItem: true }
                }
            }
        });

        if (!votingSession) {
            return res.status(404).json({ error: 'Session de vote non trouvée' });
        }

        // Vérifier si l'utilisateur fait partie du groupe
        const isMember = votingSession.movieList.sharedLists.some(sharedList =>
            sharedList.group.members.some(member => member.userId === userId)
        );

        if (!isMember) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        // Ajouter la session de vote à la requête pour une utilisation ultérieure
        req.votingSession = votingSession;
        next();
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'appartenance au groupe:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification de l\'appartenance au groupe' });
    }
}

// Créer une nouvelle session de vote
app.post('/api/voting-sessions', authenticateJWT, async (req, res) => {
    const { movieListId, description, endTime } = req.body;
    const userId = req.user.userId;

    try {
        // Vérifiez si la liste de films existe et appartient à l'utilisateur
        const movieList = await prisma.movieList.findUnique({
            where: { id: movieListId },
            include: {
                user: true,
                sharedLists: {
                    include: {
                        group: {
                            include: {
                                members: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!movieList || movieList.userId !== userId) {
            return res.status(404).json({ error: 'Liste de films non trouvée ou accès non autorisé' });
        }

        // Créer la session de vote
        const votingSession = await prisma.votingSession.create({
            data: {
                movieListId,
                description,
                endTime: new Date(endTime),
            }
        });

        // Créer des notifications pour chaque membre du groupe
        const notifications = movieList.sharedLists.flatMap(sharedList =>
            sharedList.group.members.map(member => ({
                userId: member.userId,
                senderId: userId,
                type: 'voting_session_started',
                status: 'unread',
                message: `Un vote a été lancé par ${movieList.user.pseudo} ! Votez pour le film à regarder avec votre groupe <a href="/voting-sessions/${votingSession.id}">Voir le vote</a>`,
                votingSessionId: votingSession.id
            }))
        );

        await prisma.notification.createMany({
            data: notifications
        });

        res.status(201).json(votingSession);
    } catch (error) {
        console.error('Erreur lors de la création de la session de vote:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la session de vote' });
    }
});

// Récupérer les détails d'une session de vote
app.get('/api/voting-sessions/:sessionId', authenticateJWT, checkGroupMembership, async (req, res) => {
    try {
        const votingSession = req.votingSession;

        // Calculer le temps restant
        const now = new Date();
        const timeRemaining = Math.max(0, new Date(votingSession.endTime) - now);

        res.status(200).json({ ...votingSession, timeRemaining });
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de la session de vote:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des détails de la session de vote' });
    }
});

// Voter pour un film dans une session de vote
app.post('/api/voting-sessions/:sessionId/vote', authenticateJWT, checkGroupMembership, async (req, res) => {
    const sessionId = parseInt(req.params.sessionId);
    const { movieListItemId } = req.body;
    const userId = req.user.userId;

    if (isNaN(sessionId)) {
        return res.status(400).json({ error: 'Invalid session ID' });
    }

    try {
        const votingSession = req.votingSession;

        // Vérifiez si le film fait partie de la liste de films de la session de vote
        const movieListItem = await prisma.movieListItem.findUnique({
            where: { id: movieListItemId }
        });

        if (!movieListItem || movieListItem.listId !== votingSession.movieListId) {
            return res.status(400).json({ error: 'Film non valide pour cette session de vote' });
        }

        // Vérifiez si l'utilisateur a déjà voté dans cette session de vote
        const existingVote = await prisma.vote.findFirst({
            where: {
                userId,
                votingSessionId: sessionId
            }
        });

        if (existingVote) {
            return res.status(400).json({ error: 'Vous avez déjà voté dans cette session de vote' });
        }

        // Créer le vote
        const vote = await prisma.vote.create({
            data: {
                userId,
                votingSessionId: sessionId,
                movieListItemId
            }
        });

        res.status(201).json(vote);
    } catch (error) {
        console.error('Erreur lors du vote:', error);
        res.status(500).json({ error: 'Erreur lors du vote' });
    }
});


///////////// COMMENTAIRES /////////////

// Endpoint pour ajouter un commentaire
app.post('/api/movies/:tmdbId/comments', authenticateJWT, async (req, res) => {
    const { content, rating } = req.body;
    const userId = req.user.userId;
    const tmdbId = parseInt(req.params.tmdbId);
  
    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          rating,
          userId,
          tmdbId,
        },
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error('Failed to add comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  });
  
  // Endpoint pour récupérer les commentaires d'un film
  app.get('/api/movies/:tmdbId/comments', async (req, res) => {
    const tmdbId = parseInt(req.params.tmdbId);
  
    try {
      const comments = await prisma.comment.findMany({
        where: { tmdbId },
        include: {
          user: {
            select: {
              pseudo: true,
              profilePicture: true,
            },
          },
        },
      });
      res.status(200).json(comments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

// app.get('/api/protected', authenticateJWT, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
// });


app._router.stack.forEach((r) => {
    if (r.route) {
        console.log(`${r.route.path} - ${Object.keys(r.route.methods).join(', ')}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
