import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findGroupMemberships = async (groupId) => {
  return await prisma.groupMembership.findMany({
    where: { groupId: groupId },
    select: { userId: true },
  });
};