# --- Stage 1: Build Dependencies ---
# Tahap ini hanya untuk meng-install dependencies dan membuat cache layer
FROM node:18-alpine AS dependencies

WORKDIR /usr/src/app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install hanya production dependencies. `npm ci` lebih cepat dan aman untuk CI/CD.
RUN npm ci --only=production && npm cache clean --force


# --- Stage 2: Production Image ---
# Tahap ini membangun image akhir yang akan dijalankan di VPS
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# [SECURITY] Buat user non-root untuk menjalankan aplikasi
# Menjalankan container sebagai non-root adalah praktik keamanan yang sangat penting.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependencies yang sudah di-install dari tahap 'dependencies'
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy sisa source code aplikasi
COPY . .

# [PRISMA] Generate Prisma Client berdasarkan schema Anda
# Langkah ini wajib setelah source code (terutama prisma/schema.prisma) di-copy
RUN npx prisma generate

# [SECURITY] Berikan kepemilikan folder aplikasi kepada user non-root
RUN chown -R appuser:appgroup /usr/src/app

# Ganti ke user non-root
USER appuser

# Expose port yang digunakan oleh aplikasi
EXPOSE 3000

# Command untuk menjalankan aplikasi saat container dimulai
# Menggunakan "npm start" lebih disarankan daripada "node src/app.js"
CMD [ "npm", "start" ]