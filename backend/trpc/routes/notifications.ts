import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { sendNotificationToPlayer, sendNotificationToPlayers } from "@/backend/services/onesignal";

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
      return await sendNotificationToPlayer(
        input.playerId,
        input.title,
        input.message,
        input.data
      );
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
      return await sendNotificationToPlayers(
        input.playerIds,
        input.title,
        input.message,
        input.data
      );
    }),
});
