# --- Stage 1: Instalasi Dependensi ---
FROM node:18-alpine AS dependencies
WORKDIR /usr/src/app

# Copy package files DAN schema prisma terlebih dahulu
COPY package*.json ./
COPY prisma ./prisma

# Install dependensi produksi (postinstall akan berjalan dan berhasil)
RUN npm ci --only=production

# --- Stage 2: Image Produksi Final ---
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# [SECURITY] Buat user non-root untuk keamanan
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy node_modules dari stage dependencies
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy source code aplikasi
COPY . .

# [SECURITY] Berikan kepemilikan folder kepada user non-root
RUN chown -R appuser:appgroup /usr/src/app

# Ganti ke user non-root
USER appuser

# Expose port yang digunakan aplikasi
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD [ "npm", "start" ]