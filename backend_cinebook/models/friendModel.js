import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};

export const findFriendship = async (userId, friendId) => {
  return await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });
};

export const createNotification = async (userId, senderId, type) => {
  return await prisma.notification.create({
    data: {
      userId: userId,
      senderId: senderId,
      type: type,
    },
  });
};

export const deleteFriendship = async (userId, friendId) => {
  return await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });
};

export const findFriends = async (userId) => {
  return await prisma.friendship.findMany({
    where: { userId: userId },
    include: {
      friend: { select: { id: true, email: true, pseudo: true } },
    },
  });
};

export const createFriendship = async (userId, friendId) => {
  return await prisma.friendship.create({
    data: {
      userId: userId,
      friendId: friendId,
    },
  });
};