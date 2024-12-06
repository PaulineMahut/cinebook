import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createUser = async (data) => {
  return await prisma.user.create({ data });
};

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      pseudo: true,
      email: true,
      profilePicture: true,
      rgpdAccepted: true,
    },
  });
};

export const getUserProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      pseudo: true,
      role: true,
      profilePicture: true,
      friends: true,
      movieLists: true,
      memberships: true,
    },
  });
};

export const updateUserProfile = async (userId, data) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
};

export const getUserProfileById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      pseudo: true,
      profilePicture: true,
      friends: {
        select: { friendId: true },
      },
    },
  });
};

export const findUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};