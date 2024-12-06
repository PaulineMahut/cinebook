import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createGroup = async (data) => {
  return await prisma.group.create({ data });
};

export const getGroupsByUserId = async (userId) => {
  return await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              pseudo: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

export const getGroupById = async (groupId) => {
  return await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      creator: {
        select: {
          id: true,
          pseudo: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              pseudo: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });
};

export const updateGroup = async (groupId, data) => {
  return await prisma.group.update({
    where: { id: groupId },
    data,
  });
};

export const deleteGroup = async (groupId) => {
  return await prisma.group.delete({
    where: { id: groupId },
  });
};

export const addGroupMembership = async (data) => {
  return await prisma.groupMembership.create({ data });
};

export const deleteGroupMemberships = async (groupId, userIds) => {
  return await prisma.groupMembership.deleteMany({
    where: {
      groupId: groupId,
      userId: { in: userIds },
    },
  });
};

export const getGroupMemberships = async (groupId) => {
  return await prisma.groupMembership.findMany({
    where: { groupId: groupId },
    select: { userId: true },
  });
};

export const findGroupMembership = async (userId, groupId) => {
  return await prisma.groupMembership.findUnique({
    where: {
      userId_groupId: {
        userId: userId,
        groupId: groupId,
      },
    },
  });
};

export const findGroupById = async (groupId) => {
    return await prisma.group.findUnique({
      where: { id: groupId },
    });
  };