import jwt from 'jsonwebtoken';

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('Received token:', token); // Log du token

  if (!token) {
      console.log('No token provided'); // Log si le token est absent
      return res.sendStatus(401); // Pas d'autorisation
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
          console.error('Token verification error:', err); // Log d'erreur de vérification
          return res.sendStatus(403);
      }
      console.log('Decoded user:', user); // Log de l'utilisateur décodé
      req.user = user;
      next();
  });
};

export function logout() {
  localStorage.removeItem('token'); // Supprimer le token du localStorage
  window.location.href = '/login'; // Rediriger vers la page de connexion
}


export default authenticateJWT;


