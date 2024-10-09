import jwt from 'jsonwebtoken';

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('Token:', token); // Log du token

  if (!token) {
      return res.sendStatus(401); // Pas d'autorisation
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
          console.log('Token verification error:', err); // Log des erreurs de vérification
          return res.sendStatus(403);
      }
      console.log('Decoded user:', user); // Log de l'utilisateur décodé
      req.user = user;
      next();
  });
};
export default authenticateJWT;
