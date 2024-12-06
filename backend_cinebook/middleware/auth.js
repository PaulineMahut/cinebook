import jwt from 'jsonwebtoken';

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('Received token:', token); 

  if (!token) {
      console.log('No token provided'); 
      return res.sendStatus(401); 
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
          console.error('Token verification error:', err);
          return res.sendStatus(403);
      }
      console.log('Decoded user:', user); 
      req.user = user;
      next();
  });
};

export function logout() {
  localStorage.removeItem('token'); 
  window.location.href = '/login'; 
}


export default authenticateJWT;


