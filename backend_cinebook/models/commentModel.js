import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createComment = async (data) => {
  return await prisma.comment.create({
    data,
  });
};

export const findCommentsByTmdbId = async (tmdbId) => {
  return await prisma.comment.findMany({
    where: { tmdbId },
    include: {
      user: {
        select: {
          pseudo: true,
          profilePicture: true,
        },
      },
    },
  });
};