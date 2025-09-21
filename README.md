## Pesantren Modern Website

Modern Islamic boarding school (Pesantren) website built with Next.js App Router. Includes structured content models, dark mode, SEO optimization, sitemap generation, and integration points for MongoDB + Cloudinary.

### Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS (v4) + design tokens
- MongoDB (Mongoose ORM)
- Cloudinary (media storage)
- next-seo (SEO defaults)
- next-sitemap (sitemap & robots.txt)

### Features

- Responsive layout with Navbar & Footer
- Dark / Light theme with localStorage persistence
- Modular Mongoose models (User, News, Article, Event, Testimonial, Gallery)
- Centralized DB + Cloudinary config
- SEO defaults + OpenGraph + Twitter integration
- Sitemap generation on build
- Extensible component architecture

### Project Structure

```
src/
   app/
      (routes)... e.g. profile, news, events, etc.
      layout.tsx        # Root layout with Providers, Navbar, Footer
      page.tsx          # Home page
   components/
      Navbar.tsx
      Footer.tsx
      Hero.tsx
      ThemeToggle.tsx
      Providers.tsx
      Container.tsx
   lib/
      db.ts             # MongoDB connection helper (singleton)
      cloudinary.ts     # Cloudinary config
   models/
      User.ts
      News.ts
      Article.ts
      Event.ts
      Testimonial.ts
      Gallery.ts
   types/
      env.d.ts          # Environment variable typing
next-seo.config.ts
next-sitemap.config.js
.env.example
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```
MONGODB_URI=...
MONGODB_DB_NAME=pesantren
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SITE_URL=https://www.pesantren-example.com
NEXT_PUBLIC_ANALYTICS_ID=
```

### Scripts

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start dev server                 |
| `npm run build`   | Build + generate sitemap         |
| `npm start`       | Start production server          |
| `npm run sitemap` | Manually generate sitemap/robots |
| `npm run lint`    | Run ESLint                       |

### Tailwind CSS

Tailwind v4 using the `@import "tailwindcss"` entry and custom CSS variables for semantic tokens. Dark mode is class-based (`.dark` on `<html>`).

### Dark Mode

Implemented with a `ThemeToggle` component and a hydration-safe initialization inside `Providers`.

### Models Overview

- `User`: authentication & role management scaffold
- `News`: time-sensitive announcements
- `Article`: long-form blog-style content
- `Event`: scheduled activities (with start/end dates)
- `Testimonial`: quotes & feedback
- `Gallery`: Cloudinary-backed media items

### Adding New Models

Follow pattern in existing schemas: define interface, schema, indexes, and export with `models.ModelName || model<ModelInterface>()` to avoid recompilation issues in dev.

### SEO

`next-seo.config.ts` centralizes defaults. Use per-page overrides by exporting `metadata` in route segments or using `NextSeo` component when dynamic.

### Sitemap

`next-sitemap.config.js` runs automatically post build (hooked via build script). Adjust `exclude` or add additional config as needed.

### Cloudinary Usage (Example)

```ts
import cloudinary from "@/lib/cloudinary";

export async function uploadImage(filePath: string) {
  return cloudinary.uploader.upload(filePath, { folder: "pesantren" });
}
```

### MongoDB Connection

Use the singleton helper to prevent multiple connections:

```ts
import { connectDB } from "@/lib/db";
await connectDB();
```

### Roadmap / Next Steps

- Auth (NextAuth or custom) + Admin role enforcement
- API routes / server actions for CRUD
- Image optimization and gallery grid
- Dynamic slugs for news/articles/events
- Form handling (contact & donation pledge)
- Internationalization (ID + EN)

### License

MIT

---

Built with care for modern pesantren needs.

Add MongoDB and Cloudinary integration to the project.

Requirements:

1. In `lib/db.ts`, create a reusable MongoDB connection using Mongoose.

   - Ensure connection is cached to avoid multiple connections in development.
   - Export the connection.

2. In `lib/cloudinary.ts`, configure Cloudinary:

   - Import cloudinary v2.
   - Setup config with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` from environment variables.
   - Export upload functions for images and videos.

3. Update `.env.local.example` with:

   - MONGODB_URI
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

4. Create Mongoose models inside `models/`:

   - User (name, email, password hash, role: "admin" or "user").
   - News (title, content, date, author).
   - Article (title, content, tags, date, author).
   - Event (title, description, date, location).
   - Testimonial (name, message, createdAt).
   - Gallery (title, imageUrl or videoUrl, type: "photo" or "video", createdAt).

5. Ensure all code is TypeScript-ready and production-safe.
