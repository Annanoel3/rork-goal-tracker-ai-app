import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { sendPushNotification, sendPushNotifications } from "@/backend/services/onesignal";

export const notificationsRouter = createTRPCRouter({
  sendToUser: publicProcedure
    .input(
      z.object({
        expoPushToken: z.string(),
        title: z.string(),
        message: z.string(),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendPushNotification(
        input.expoPushToken,
        input.title,
        input.message,
        input.data
      );
    }),

  sendToUsers: publicProcedure
    .input(
      z.object({
        expoPushTokens: z.array(z.string()),
        title: z.string(),
        message: z.string(),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendPushNotifications(
        input.expoPushTokens,
        input.title,
        input.message,
        input.data
      );
    }),
});
