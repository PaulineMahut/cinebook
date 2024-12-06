import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const addFavorite = async (userId, movieData) => {
  const { title, overview, voteAverage, tmdbId, genreIds, genres } = movieData;

  // Vérifiez et créez les genres si nécessaire avec noms
  const genreRecords = await Promise.all(
    genreIds.map(async (id, index) => {
      let genre = await prisma.genre.findUnique({
        where: { id: id },
      });

      if (!genre) {
        genre = await prisma.genre.create({
          data: { id: id, name: genres[index] },
        });
      }
      return genre;
    })
  );

  // Vérifiez si le film existe déjà
  const existingMovie = await prisma.movie.findUnique({
    where: { tmdbId: tmdbId },
  });

  let movieId;

  if (!existingMovie) {
    const movie = await prisma.movie.create({
      data: {
        title,
        overview,
        voteAverage,
        tmdbId,
        genres: {
          connect: genreRecords.map((genre) => ({ id: genre.id })),
        },
      },
    });
    movieId = movie.id;
  } else {
    movieId = existingMovie.id;
  }

  await prisma.userMovie.create({
    data: {
      userId: userId,
      movieId: movieId,
    },
  });

  return { message: 'Movie added to user successfully.' };
};

export const getFavoriteMovies = async (userId) => {
  const userMovies = await prisma.userMovie.findMany({
    where: { userId: userId },
    include: {
      movie: {
        include: {
          genres: true,
        },
      },
    },
  });

  return userMovies.map(userMovie => ({
    id: userMovie.movie.id,
    title: userMovie.movie.title,
    tmdbId: userMovie.movie.tmdbId,
    genres: userMovie.movie.genres,
  }));
};

export const checkMovieExists = async (tmdbId) => {
  return await prisma.movie.findUnique({
    where: { tmdbId: tmdbId },
  });
};

export const deleteFavorite = async (userId, tmdbId) => {
  const userMovie = await prisma.userMovie.findFirst({
    where: {
      userId: userId,
      movie: {
        tmdbId: tmdbId,
      },
    },
  });

  if (!userMovie) {
    throw new Error('Movie not found in user collection');
  }

  await prisma.userMovie.delete({
    where: {
      id: userMovie.id,
    },
  });

  const movie = await prisma.movie.findUnique({
    where: { tmdbId: tmdbId },
  });

  if (!movie) {
    throw new Error('Movie not found');
  }

  await prisma.movie.delete({
    where: { id: movie.id },
  });

  return { message: 'Movie deleted successfully' };
};

export const checkUserMovieExists = async (userId, tmdbId) => {
  const userMovie = await prisma.userMovie.findFirst({
    where: {
      userId: userId,
      movie: {
        tmdbId: tmdbId,
      },
    },
  });

  return userMovie ? { exists: true } : { exists: false };
};