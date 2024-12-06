import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getUserMoviesWithGenres = async (userId) => {
  return await prisma.userMovie.findMany({
    where: { userId: userId },
    include: {
      movie: {
        include: {
          genres: true, // Include genres of the movies
        },
      },
    },
  });
};

export const getRecommendedMovies = async (genreIds, userId) => {
  return await prisma.movie.findMany({
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
};