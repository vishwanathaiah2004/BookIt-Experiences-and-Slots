# BookIt: Experiences & Slots 🌍

A full-stack web application built with **Next.js** and **Supabase (PostgreSQL)**.  
Users can explore travel experiences, view available slots, and complete bookings — all in a responsive, modern UI.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | Next.js (TypeScript) |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Supabase) |
| Deployment | Vercel (Frontend + API) |
| State / Data | React Hooks + Axios |

---

## ⚙️ Features

- 🏡 **Home Page:** Browse experiences fetched from Supabase (Static Generation).  
- 📖 **Details Page:** Dynamic route with experience details and available slots.  
- 💳 **Checkout Page:** Collect user info, validate promo code, and confirm booking.  
- ✅ **Result Page:** Display booking success or failure.
- 🔐 **Backend APIs:**  
  - `GET /api/experiences` → fetch all experiences  
  - `GET /api/experiences/[id]` → fetch single experience  
  - `POST /api/bookings` → add new booking  
  - `POST /api/promo/validate` → validate promo codes  

---

## 🧱 Rendering Strategy

| Page | Route | Rendering Type | Description |
|-------|--------|----------------|--------------|
| Home | `/` | **SSG** | Static data for faster browsing |
| Details | `/experience/[id]` | **ISR** | Incremental revalidation for updated info |
| Checkout | `/checkout` | **SSR** | Always fresh slot and price info |
| Result | `/result` | **CSR** | Client-only logic for confirmation |

---

## 🔌 Environment Variables

Create a `.env.local` file in the root of your Next.js app:





