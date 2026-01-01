import { z } from 'zod';
import { publicProcedure, createTRPCRouter } from '../create-context';
import {
  sendNotificationToPlayer,
  sendNotificationToUser,
  sendNotificationToPlayers,
  sendNotificationToUsers,
} from '../../services/onesignal';

export const notificationsRouter = createTRPCRouter({
  sendToPlayer: publicProcedure
    .input(
      z.object({
        playerId: z.string(),
        title: z.string(),
        message: z.string(),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await sendNotificationToPlayer(
        input.playerId,
        input.title,
        input.message,
        input.data
      );
      return { success: true, result };
    }),

  sendToUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        title: z.string(),
        message: z.string(),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await sendNotificationToUser(
        input.userId,
        input.title,
        input.message,
        input.data
      );
      return { success: true, result };
    }),

  sendToPlayers: publicProcedure
    .input(
      z.object({
        playerIds: z.array(z.string()),
        title: z.string(),
        message: z.string(),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await sendNotificationToPlayers(
        input.playerIds,
        input.title,
        input.message,
        input.data
      );
      return { success: true, result };
    }),

  sendToUsers: publicProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        title: z.string(),
        message: z.string(),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await sendNotificationToUsers(
        input.userIds,
        input.title,
        input.message,
        input.data
      );
      return { success: true, result };
    }),
});
