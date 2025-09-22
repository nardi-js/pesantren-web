# Pesantren Web - Production Ready

Website modern untuk pesantren dengan sistem manajemen konten lengkap, dibangun dengan Next.js 15 dan MongoDB.

## 🚀 Deployment ke Vercel

### 1. Persiapan Repository
```bash
git add .
git commit -m "Production ready build"
git push origin main
```

### 2. Environment Variables di Vercel
Tambahkan environment variables berikut di Vercel Dashboard:

- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB_NAME`: pesantren
- `JWT_SECRET`: Secret key untuk JWT authentication
- `ADMIN_DEFAULT_EMAIL`: Email admin default
- `ADMIN_DEFAULT_PASSWORD`: Password admin default
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `SITE_URL`: URL domain production (https://your-domain.vercel.app)

### 3. Deploy ke Vercel
1. Import project dari GitHub ke Vercel
2. Set environment variables
3. Deploy

## 🛠 Fitur

- ✅ Next.js 15 dengan App Router
- ✅ MongoDB dengan Mongoose
- ✅ Authentication sistem admin
- ✅ CRUD untuk semua konten (Blog, Events, News, Gallery, Testimonials)
- ✅ Upload gambar dengan Cloudinary
- ✅ YouTube video integration
- ✅ Responsive design
- ✅ SEO optimized
- ✅ Sitemap generation
- ✅ TypeScript support

## 📱 Admin Panel

Akses admin panel di `/admin/login` dengan credentials yang sudah diset di environment variables.

### Modul Admin:
- Dashboard dengan statistik
- Blog management
- Event management
- News management
- Gallery management
- Testimonials management
- Contact management
- Campaign management

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production
npm run build

# Start production server
npm start
```

## 📄 License

MIT License