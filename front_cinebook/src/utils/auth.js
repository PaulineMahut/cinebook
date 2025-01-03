import router from '../router/index'; // Assurez-vous d'importer le routeur

export function isTokenExpired(token) {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir en millisecondes
    return Date.now() > exp;
}

export function logout() {
    localStorage.removeItem('token'); // Supprime le token du localStorage
    // Redirection par la suite
}