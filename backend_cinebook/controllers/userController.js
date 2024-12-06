import { getAllUsers, getUserProfile, updateUserProfile, getUserProfileById } from '../models/userModel.js';

export const getAllUsersController = async (req, res) => {
  const search = req.query.search || '';

  try {
    const users = await getAllUsers();

    const filteredUsers = users.filter(user =>
      (user.pseudo && user.pseudo.toLowerCase().includes(search.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
    );

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserProfileController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

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
};

export const updateUserProfileController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { pseudo, email, currentProfilePictureUrl } = req.body;
    let profilePicture = currentProfilePictureUrl;

    if (req.file) {
      profilePicture = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await updateUserProfile(userId, { pseudo, email, profilePicture });

    console.log('Profil utilisateur mis à jour:', updatedUser);

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil utilisateur' });
  }
};

export const getUserProfileByIdController = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await getUserProfileById(userId);

    if (!user) {
      console.error(`Utilisateur avec l'ID ${userId} non trouvé`);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const friendCount = user.friends.length;
    console.log(`Utilisateur trouvé : ${user.email}, ${user.pseudo}, Nombre d'amis : ${friendCount}`);

    res.json({
      email: user.email,
      pseudo: user.pseudo,
      profilePicture: user.profilePicture,
      friendCount,
    });
  } catch (error) {
    console.error('Erreur lors de la recherche dans la base de données:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};