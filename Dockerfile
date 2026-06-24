FROM drnik/node-base:20 AS base
WORKDIR /workspace/clinic
USER root

FROM base AS deps
ARG NPM_REGISTRY=https://registry.npmjs.org
COPY package.json package-lock.json* ./
RUN npm install --registry=${NPM_REGISTRY}

FROM base AS builder
COPY --from=deps /workspace/clinic/node_modules ./node_modules
COPY . .
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/dr_nik_clinic
ENV SMTP_HOST=mailpit
ENV SMTP_PORT=1025
ENV SMTP_SECURE=false
ENV STAFF_NOTIFICATION_EMAIL=staff@drnikclinic.local
RUN npm run prisma:generate && npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /workspace/clinic
COPY --from=builder /workspace/clinic/.next ./.next
COPY --from=builder /workspace/clinic/public ./public
COPY --from=builder /workspace/clinic/prisma ./prisma
COPY --from=builder /workspace/clinic/package.json ./package.json
COPY --from=builder /workspace/clinic/node_modules ./node_modules
EXPOSE 3000
CMD ["sh", "-c", "npm run prisma:migrate:deploy && npm run start"]
