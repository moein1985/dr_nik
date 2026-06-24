import { z } from "zod";
import { prisma } from "@/server/shared/prisma-client";
import { createTRPCRouter, patientProcedure } from "@/server/api/trpc";
import { AI_ERROR_MESSAGES } from "@/server/shared/error-messages";

type AiProviderSettingsRow = {
  id: string;
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string | null;
  isEnabled: boolean;
};

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

type DoctorProfileRow = {
  id: string;
  userId: string;
  aboutMe: string | null;
  credentials: string | null;
  acceptedInsurances: string | null;
  workingHours: string | null;
  specialties: string | null;
  services: string | null;
  branchAddress: string | null;
  experience: string | null;
  extraNotes: string | null;
  aiProfileContext: string | null;
};

type UserRow = {
  id: string;
  username: string | null;
  email: string | null;
};

const defaultAiSettings = {
  provider: "avalai",
  model: "gemini-2.5-flash",
  apiKey: "",
  baseUrl: "https://api.avalai.ir/v1",
  isEnabled: true,
};

const QUOTA_LIMIT = 5;

async function getOrCreateChatSession(patientUserId: string, doctorUserId: string) {
  try {
    const sessions = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "ChatSession"
      WHERE "patientUserId" = ${patientUserId}
        AND "doctorUserId" = ${doctorUserId}
      LIMIT 1
    `;

    if (sessions.length > 0) {
      return sessions[0]?.id;
    }

    // Create new session
    const id = require("crypto").randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "ChatSession" ("id", "patientUserId", "doctorUserId", "status", "createdAt", "updatedAt")
      VALUES (${id}, ${patientUserId}, ${doctorUserId}, 'ACTIVE', now(), now())
    `;
    return id;
  } catch (err) {
    console.error("Error managing chat session:", err);
    return null;
  }
}

async function getQuotaUsage(patientUserId: string, doctorUserId: string): Promise<number> {
  try {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::int as count
      FROM "ChatMessage" cm
      INNER JOIN "ChatSession" cs ON cm."sessionId" = cs."id"
      WHERE cs."patientUserId" = ${patientUserId}
        AND cs."doctorUserId" = ${doctorUserId}
        AND cm."role" = 'user'
    `;

    return result[0]?.count ? Number(result[0].count) : 0;
  } catch (err) {
    console.error("Error checking quota:", err);
    return 0;
  }
}

async function recordChatMessage(sessionId: string, role: "user" | "assistant", content: string) {
  try {
    const id = require("crypto").randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "ChatMessage" ("id", "sessionId", "role", "content", "createdAt")
      VALUES (${id}, ${sessionId}, ${role}, ${content}, now())
    `;
    return true;
  } catch (err) {
    console.error("Error recording message:", err);
    return false;
  }
}

async function readAiSettings() {
  try {
    const rows = await prisma.$queryRaw<AiProviderSettingsRow[]>`
      SELECT "id", "provider", "model", "apiKey", "baseUrl", "isEnabled"
      FROM "AiProviderSetting"
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `;

    const row = rows[0];

    if (!row) {
      return defaultAiSettings;
    }

    return {
      provider: row.provider,
      model: row.model,
      apiKey: row.apiKey,
      baseUrl: row.baseUrl || defaultAiSettings.baseUrl,
      isEnabled: row.isEnabled,
    };
  } catch {
    return defaultAiSettings;
  }
}

async function readDoctorProfile(doctorUserId: string) {
  try {
    const profiles = await prisma.$queryRaw<DoctorProfileRow[]>`
      SELECT
        "id", "userId", "aboutMe", "credentials", "acceptedInsurances",
        "workingHours", "specialties", "services", "branchAddress",
        "experience", "extraNotes", "aiProfileContext"
      FROM "DoctorProfile"
      WHERE "userId" = ${doctorUserId}
      LIMIT 1
    `;

    if (profiles.length === 0) {
      return null;
    }

    return profiles[0];
  } catch {
    return null;
  }
}

async function readDoctorUser(doctorUserId: string) {
  try {
    const users = await prisma.$queryRaw<UserRow[]>`
      SELECT "id", "username", "email"
      FROM "User"
      WHERE "id" = ${doctorUserId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return null;
    }

    return users[0];
  } catch {
    return null;
  }
}

function buildSystemPrompt(doctorProfile?: DoctorProfileRow | null, doctorUser?: UserRow | null): string {
  const basePrompt =
    "You are a Persian beauty-clinic assistant. Give safe, short, non-diagnostic guidance and suggest clinic booking or staff follow-up when needed.";

  if (!doctorProfile || !doctorUser) {
    return basePrompt;
  }

  const parts: string[] = [basePrompt];

  const doctorName = doctorUser.username || AI_ERROR_MESSAGES.DEFAULT_DOCTOR_NAME;
  parts.push(`You are assisting for Dr. ${doctorName}'s beauty clinic.`);

  if (doctorProfile.aboutMe?.trim()) {
    parts.push(`Doctor's background: ${doctorProfile.aboutMe}`);
  }

  if (doctorProfile.credentials?.trim()) {
    parts.push(`Credentials: ${doctorProfile.credentials}`);
  }

  if (doctorProfile.specialties?.trim()) {
    parts.push(`Specialties: ${doctorProfile.specialties}`);
  }

  if (doctorProfile.services?.trim()) {
    parts.push(`Services offered: ${doctorProfile.services}`);
  }

  if (doctorProfile.workingHours?.trim()) {
    parts.push(`Working hours: ${doctorProfile.workingHours}`);
  }

  if (doctorProfile.acceptedInsurances?.trim()) {
    parts.push(`Accepted insurances: ${doctorProfile.acceptedInsurances}`);
  }

  if (doctorProfile.branchAddress?.trim()) {
    parts.push(`Location: ${doctorProfile.branchAddress}`);
  }

  if (doctorProfile.experience?.trim()) {
    parts.push(`Experience: ${doctorProfile.experience}`);
  }

  if (doctorProfile.aiProfileContext?.trim()) {
    parts.push(`Additional context for AI: ${doctorProfile.aiProfileContext}`);
  }

  return parts.join(" ");
}

function extractAssistantText(response: OpenAiChatResponse): string {
  const rawContent = response.choices?.[0]?.message?.content;

  if (!rawContent) {
    return AI_ERROR_MESSAGES.NO_RESPONSE;
  }

  if (typeof rawContent === "string") {
    return rawContent.trim() || AI_ERROR_MESSAGES.NO_RESPONSE;
  }

  const combined = rawContent
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n");

  return combined || AI_ERROR_MESSAGES.NO_RESPONSE;
}

export const aiRouter = createTRPCRouter({
  warmup: patientProcedure.query(async () => {
    const settings = await readAiSettings();
    
    if (!settings.isEnabled) {
      return {
        ready: false,
        reason: "DISABLED",
      };
    }

    if (!settings.apiKey.trim()) {
      return {
        ready: false,
        reason: "NOT_CONFIGURED",
      };
    }

    return {
      ready: true,
      reason: "READY",
    };
  }),

  createMessage: patientProcedure
    .input(
      z.object({
        text: z.string().trim().min(2).max(1000),
        imageUrl: z.string().trim().url().optional(),
        doctorUserId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const patientUserId = ctx.userId;

      const settings = await readAiSettings();

      if (!settings.isEnabled) {
        return {
          reply: AI_ERROR_MESSAGES.ASSISTANT_DISABLED,
          queueStatus: "DISABLED" as const,
          quotaRemaining: 0,
        };
      }

      if (!settings.apiKey.trim()) {
        return {
          reply: AI_ERROR_MESSAGES.NOT_CONFIGURED,
          queueStatus: "NOT_CONFIGURED" as const,
          quotaRemaining: 0,
        };
      }

      // Check quota before proceeding
      if (input.doctorUserId) {
        const quotaUsed = await getQuotaUsage(patientUserId, input.doctorUserId);
        if (quotaUsed >= QUOTA_LIMIT) {
          return {
            reply: AI_ERROR_MESSAGES.QUOTA_EXCEEDED(QUOTA_LIMIT),
            queueStatus: "QUOTA_EXCEEDED" as const,
            quotaRemaining: 0,
          };
        }
      }

      const endpointBase = settings.baseUrl.replace(/\/+$/, "");
      const endpoint = `${endpointBase}/chat/completions`;

      // Load doctor context if provided
      let doctorProfile: DoctorProfileRow | null = null;
      let doctorUser: UserRow | null = null;
      if (input.doctorUserId) {
        const profile = await readDoctorProfile(input.doctorUserId);
        const user = await readDoctorUser(input.doctorUserId);
        doctorProfile = profile ?? null;
        doctorUser = user ?? null;
      }

      const systemPrompt = buildSystemPrompt(doctorProfile, doctorUser);

      const userContent = input.imageUrl
        ? [
            { type: "text", text: input.text },
            { type: "image_url", image_url: { url: input.imageUrl } },
          ]
        : input.text;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      try {
        let lastError: Error | null = null;
        const maxRetries = 2;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${settings.apiKey}`,
              },
              body: JSON.stringify({
                model: settings.model,
                temperature: 0.3,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userContent },
                ],
              }),
              signal: controller.signal,
            });

            if (!response.ok) {
              const errorText = await response.text();
              lastError = new Error(`HTTP ${response.status}: ${errorText}`);
              
              if (attempt < maxRetries && response.status >= 500) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
              }
              
              return {
                reply: AI_ERROR_MESSAGES.CONNECTION_FAILED(response.status),
                queueStatus: "FAILED" as const,
                quotaRemaining: input.doctorUserId ? QUOTA_LIMIT - (await getQuotaUsage(patientUserId, input.doctorUserId)) : 0,
                providerError: errorText.slice(0, 400),
                retryable: response.status >= 500,
              };
            }

            const data = (await response.json()) as OpenAiChatResponse;
            const reply = extractAssistantText(data);

            // Record messages if doctor context exists
            if (input.doctorUserId) {
              const sessionId = await getOrCreateChatSession(patientUserId, input.doctorUserId);
              if (sessionId) {
                await recordChatMessage(sessionId, "user", input.text);
                await recordChatMessage(sessionId, "assistant", reply);
              }
            }

            const quotaUsed = input.doctorUserId ? await getQuotaUsage(patientUserId, input.doctorUserId) : 0;
            const quotaRemaining = Math.max(0, QUOTA_LIMIT - quotaUsed);

            return {
              reply,
              queueStatus: "PROCESSED" as const,
              quotaRemaining,
            };
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            
            if (attempt < maxRetries && !controller.signal.aborted) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
              continue;
            }
            
            break;
          }
        }

        return {
          reply: controller.signal.aborted 
            ? AI_ERROR_MESSAGES.TIMEOUT
            : AI_ERROR_MESSAGES.GENERAL_ERROR,
          queueStatus: "TIMEOUT" as const,
          quotaRemaining: input.doctorUserId ? QUOTA_LIMIT - (await getQuotaUsage(patientUserId, input.doctorUserId)) : 0,
          retryable: true,
        };
      } finally {
        clearTimeout(timeout);
      }
    }),

  getChatHistory: patientProcedure
    .input(
      z.object({
        doctorUserId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const messages = await prisma.$queryRaw<
          Array<{ id: string; role: string; content: string; createdAt: Date }>
        >`
          SELECT cm."id", cm."role", cm."content", cm."createdAt"
          FROM "ChatMessage" cm
          INNER JOIN "ChatSession" cs ON cm."sessionId" = cs."id"
          WHERE cs."patientUserId" = ${ctx.userId}
            AND cs."doctorUserId" = ${input.doctorUserId}
          ORDER BY cm."createdAt" ASC
        `;

        return messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }));
      } catch (err) {
        console.error("Error fetching chat history:", err);
        return [];
      }
    }),
});
