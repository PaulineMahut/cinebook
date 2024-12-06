import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findVotingSessionById = async (sessionId) => {
  return await prisma.votingSession.findUnique({
    where: { id: sessionId },
    include: {
      movieList: {
        include: {
          user: true,
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
};

export const createVotingSession = async (data) => {
  return await prisma.votingSession.create({
    data,
  });
};

export const findMovieListById = async (movieListId) => {
  return await prisma.movieList.findUnique({
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
};

export const createVote = async (data) => {
  return await prisma.vote.create({
    data,
  });
};

export const findVoteByUserAndSession = async (userId, sessionId) => {
  return await prisma.vote.findFirst({
    where: {
      userId,
      votingSessionId: sessionId
    }
  });
};

export const findMovieListItemById = async (movieListItemId) => {
  return await prisma.movieListItem.findUnique({
    where: { id: movieListItemId }
  });
};