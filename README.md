

Here is a high-quality, professional `README.md` template tailored specifically to the technical architecture we've built.

---

# YUNITY STUDIO – AI Performance Architect

**Yunity Studio** is a premium, full-stack AI-driven Fitness and Nutrition SaaS designed for elite performance tracking. It leverages large language models to architect personalized 7-day workout splits and nutritional strategies based on real-time physiological metrics.

## 🚀 Key Features

* **AI Nutrition Architect:** Calculates TDEE using the Mifflin-St Jeor equation and generates goal-specific meal plans.
* **AI Personal Trainer (Premium):** Generates structured 7-day workout cycles with exercise, set, and rep depth.
* **Dynamic Progress Tracking:** Visualizes weight history and physiological trends via interactive charts.
* **Subscription Lifecycle:** Full Stripe integration including Checkout, Webhooks, and a self-service Billing Portal.
* **Secure Onboarding:** Multi-step flow for precise data collection and initial target calculation.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 15+](https://nextjs.org/) (App Router, Server Actions)
* **Language:** [TypeScript](https://www.typescriptlang.org/) (Strictly Typed)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + RLS)
* **AI Engine:** [OpenAI API](https://openai.com/) (GPT-4o-mini)
* **Payments:** [Stripe API](https://stripe.com/) (Subscriptions & Webhooks)

---

## 🏗️ Technical Architecture

### **Data Flow & State Management**

The application utilizes **Next.js Server Actions** to handle data mutations, eliminating the need for traditional client-side fetching libraries and ensuring type safety from the database to the view layer.

### **Session & Security**

A custom **Middleware** layer manages Supabase session refreshing and cookie synchronization. Data privacy is enforced at the database level using **PostgreSQL Row Level Security (RLS)**, ensuring users can only access their own biometric data.

### **AI Pipeline**

We implement **Structured Prompting** to enforce JSON schema responses from OpenAI. This allows the application to parse complex nested data (Days → Exercises → Sets/Reps) directly into the UI without rendering errors.

---

## 🏁 Getting Started

### **Prerequisites**

* Node.js 18+
* Supabase Account
* Stripe Account
* OpenAI API Key

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/your-username/yunity-studio.git
cd yunity-studio

```


2. **Install dependencies**
```bash
npm install

```


3. **Configure Environment Variables**
Create a `.env.local` file and add your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
OPENAI_API_KEY=your_key
STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

```


4. **Run the development server**
```bash
npm run dev

```



---

## 🔒 Security and Optimization

* **Webhooks:** Secured using Stripe signature verification to prevent replay attacks.
* **Performance:** Implemented `force-dynamic` rendering on dashboard routes to ensure real-time data accuracy for physiological metrics.
* **Type Safety:** 100% TypeScript coverage for API responses and database schemas.

---

## 📄 License

This project is proprietary. All rights reserved by **Yunity Studio**.

---

### **How to use this:**

1. Create a file named `README.md` in your root folder.
2. Copy and paste the content above.
3. Replace `your-username` with your actual GitHub username.
4. (Optional) Add a screenshot of your dashboard under the title for maximum impact.

**Would you like me to help you write a "Technical Challenges" section for this README where we explain how we fixed the calorie-sync bug?** This shows recruiters you have great documentation skills.
