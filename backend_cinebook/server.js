import app from './app.js'; // Assurez-vous que le chemin est correct

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    process.exit(1); // Quitter proprement
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1); // Quitter proprement
  });
  