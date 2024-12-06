import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createMovieList = async (data) => {
  return await prisma.movieList.create({ data });
};

export const addMovieToList = async (listId, movieData) => {
  return await prisma.movieListItem.create({
    data: {
      listId,
      ...movieData,
    },
  });
};

export const getMovieListsByUserId = async (userId) => {
  return await prisma.movieList.findMany({
    where: { userId: userId },
  });
};

export const getMovieListById = async (listId) => {
  return await prisma.movieList.findUnique({
    where: { id: listId },
    include: {
      user: true,
      items: true,
    },
  });
};

export const updateMovieList = async (listId, data) => {
  return await prisma.movieList.update({
    where: { id: listId },
    data,
  });
};

export const deleteMovieList = async (listId) => {
  // Supprimer les votes associés aux éléments de la liste de films
  await prisma.vote.deleteMany({
    where: {
      movieListItem: {
        listId: listId,
      },
    },
  });

  // Supprimer les éléments de la liste de films
  await prisma.movieListItem.deleteMany({
    where: { listId: listId },
  });

  // Supprimer la liste de films
  return await prisma.movieList.delete({
    where: { id: listId },
  });
};

export const deleteMovieFromList = async (itemId) => {
  // Supprimer les votes associés à cet élément de la liste de films
  await prisma.vote.deleteMany({
    where: { movieListItemId: itemId },
  });

  // Supprimer l'élément de la liste de films
  return await prisma.movieListItem.delete({
    where: { id: itemId },
  });
};

export const shareMovieList = async (listId, groupId) => {
  return await prisma.sharedList.create({
    data: {
      listId,
      groupId,
    },
  });
};

export const getSharedListsByUserId = async (userId) => {
  const memberships = await prisma.groupMembership.findMany({
    where: { userId },
    select: { groupId: true },
  });

  const groupIds = memberships.map(membership => membership.groupId);

  return await prisma.sharedList.findMany({
    where: { groupId: { in: groupIds } },
    include: {
      list: {
        include: {
          items: true,
        },
      },
    },
  });
};

export const getSharedListsByGroupId = async (groupId) => {
  return await prisma.sharedList.findMany({
    where: { groupId },
    include: {
      list: {
        include: {
          items: true,
        },
      },
    },
  });
};

export const findMovieListById = async (listId) => {
    return await prisma.movieList.findUnique({
      where: { id: listId },
    });
  };