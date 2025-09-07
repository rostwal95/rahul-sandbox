FROM node:22-bookworm-slim

# Install pnpm and minimal deps (curl already present). Avoid global cache growth.
ENV PNPM_HOME=/root/.local/share/pnpm \
	NODE_ENV=development
RUN corepack enable

WORKDIR /app

# Copy only workspace manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/design-system/package.json packages/design-system/package.json
COPY packages/email-templates/package.json packages/email-templates/package.json
COPY packages/templates/package.json packages/templates/package.json
COPY packages/web-docs/package.json packages/web-docs/package.json

RUN pnpm install --frozen-lockfile

# Now copy full source
COPY . .

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm","dev","-p","3000","--hostname","0.0.0.0"]
