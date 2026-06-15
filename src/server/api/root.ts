import { appointmentRouter } from "@/server/api/routers/appointment";
import { aiRouter } from "@/server/api/routers/ai";
import { authRouter } from "@/server/api/routers/auth";
import { mediaRouter } from "@/server/api/routers/media";
import { videoRouter } from "@/server/api/routers/video";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  ai: aiRouter,
  appointment: appointmentRouter,
  auth: authRouter,
  media: mediaRouter,
  video: videoRouter,
});

export type AppRouter = typeof appRouter;
