import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createNotification = async (data) => {
  return await prisma.notification.create({
    data,
  });
};

export const createManyNotifications = async (data) => {
  return await prisma.notification.createMany({
    data,
  });
};

export const findNotificationsByUserId = async (userId) => {
  return await prisma.notification.findMany({
    where: {
      userId: userId,
      OR: [
        { status: 'pending' },
        { status: 'unread' },
        { status: 'accepted' },
      ],
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          pseudo: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
        },
      },
      list: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const findNotificationById = async (notificationId) => {
  return await prisma.notification.findUnique({
    where: { id: notificationId },
    include: { sender: true },
  });
};

export const findGroupInvitation = async (userId, groupId) => {
  return await prisma.notification.findFirst({
    where: {
      userId: userId,
      groupId: groupId,
      type: 'group_invitation',
      status: 'pending',
    },
    include: {
      sender: true,
      group: true,
    },
  });
};

export const deleteNotificationById = async (notificationId) => {
  return await prisma.notification.delete({
    where: { id: notificationId },
  });
};