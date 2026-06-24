import { appointmentRouter } from "@/server/api/routers/appointment";
import { appointmentAuditRouter } from "@/server/api/routers/appointment-audit";
import { aiRouter } from "@/server/api/routers/ai";
import { authRouter } from "@/server/api/routers/auth";
import { doctorAvailabilityRouter } from "@/server/api/routers/doctor-availability";
import { doctorServiceRouter } from "@/server/api/routers/doctor-service";
import { freshRouter } from "@/server/api/routers/fresh";
import { mediaRouter } from "@/server/api/routers/media";
import { videoRouter } from "@/server/api/routers/video";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  ai: aiRouter,
  appointment: appointmentRouter,
  appointmentAudit: appointmentAuditRouter,
  auth: authRouter,
  doctorAvailability: doctorAvailabilityRouter,
  doctorService: doctorServiceRouter,
  fresh: freshRouter,
  media: mediaRouter,
  video: videoRouter,
});

export type AppRouter = typeof appRouter;
