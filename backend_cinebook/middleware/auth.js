import jwt from 'jsonwebtoken';

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('Token:', token); // Log du token

  if (!token) {
      return res.sendStatus(401); // Pas d'autorisation
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        console.log('Token expired:', err); // Log des erreurs de token expiré
        return res.status(401).json({ message: 'TokenExpired' }); // Envoyer un message spécifique
      }
          console.log('Token verification error:', err); // Log des erreurs de vérification
          return res.sendStatus(403);
      }
      console.log('Decoded user:', user); // Log de l'utilisateur décodé
      req.user = user;
      next();
  });
};

// services/authService.js
export function logout() {
  localStorage.removeItem('token'); // Supprimer le token du localStorage
  window.location.href = '/login'; // Rediriger vers la page de connexion
}


export default authenticateJWT;


