import { createTRPCRouter } from "./create-context";
import { notificationsRouter } from "./routes/notifications";

export const appRouter = createTRPCRouter({
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
