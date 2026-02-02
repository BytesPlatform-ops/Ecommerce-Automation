# Chameleon Store 🦎

A Multi-Tenant SaaS platform that allows users to create a full-stack, customized e-commerce storefront in under 60 seconds.

## Features

- 🏪 **Multi-tenant Architecture**: Each store has isolated data with unique URLs
- 🎨 **Theme System**: 6 pre-built color themes that apply instantly
- 📦 **Product Management**: Add, edit, and delete products with image uploads
- 🔐 **Authentication**: Email/password auth with Supabase
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Fast**: Built with Next.js App Router and Turbopack

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database & Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Image Uploads**: Uploadthing
- **Deployment**: Vercel (recommended)

## Getting Started

### 1. Clone and Install

```bash
cd chameleon-store
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema:
   - Copy contents of `supabase/schema.sql` and execute
   - Copy contents of `supabase/seed.sql` and execute (creates theme presets)
3. Get your API keys from Project Settings > API

### 3. Set Up Uploadthing

1. Create an account at [uploadthing.com](https://uploadthing.com)
2. Create a new app and get your API token

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Uploadthing
UPLOADTHING_TOKEN=your-uploadthing-token
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Project Structure

```
src/
├── app/
│   ├── (admin)/                 # Protected dashboard routes
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── products/        # Product CRUD
│   │   │   ├── themes/          # Theme selection
│   │   │   └── settings/        # Store settings
│   │   └── layout.tsx           # Admin sidebar layout
│   │
│   ├── stores/[username]/       # Public storefront (dynamic)
│   │   ├── layout.tsx           # Theme injection
│   │   ├── page.tsx             # Store home (product grid)
│   │   ├── about/               # Store about page
│   │   └── product/[id]/        # Product detail page
│   │
│   ├── login/                   # Auth pages
│   ├── signup/
│   ├── onboarding/              # Store creation wizard
│   └── api/                     # API routes
│
├── components/
│   ├── auth/                    # Login/signup forms
│   ├── dashboard/               # Admin components
│   ├── onboarding/              # Onboarding form
│   └── storefront/              # Public store components
│
├── lib/
│   ├── supabase/                # Supabase clients
│   └── uploadthing.ts           # Uploadthing config
│
└── types/
    └── database.ts              # TypeScript types
```

## Database Schema

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| stores | Store branding | id, owner_id, subdomain_slug, theme_id, store_name |
| products | Product inventory | id, store_id, name, price, image_url |
| themes | Design presets | id, primary_hex, secondary_hex, font_family |

## User Flow

1. **Sign Up** → Create account with email/password
2. **Onboarding** → Enter store name + select theme
3. **Dashboard** → Manage products, change theme, edit settings
4. **Public Store** → `/stores/your-slug` - customers browse products

## Available Themes

1. 🌊 Ocean Blue
2. 🌲 Forest Green
3. 👑 Royal Purple
4. 🌅 Sunset Orange
5. 🌙 Midnight Dark
6. 🌸 Rose Pink

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Future Enhancements (Post-MVP)

- [ ] Subdomain routing (`store.yourdomain.com`)
- [ ] Payment integration (Stripe)
- [ ] Product variants (size, color)
- [ ] Analytics dashboard
- [ ] Order management
- [ ] Custom pages
- [ ] Rich text editor for About section

## License

MIT
