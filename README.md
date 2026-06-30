# AI Email Generator

A fullstack Next.js application that leverages Google's Gemini AI to instantly draft professional, persuasive, and custom-toned emails.

## 🚀 Features
- **AI Generation**: Powered by Gemini 2.5 Flash for lightning-fast email composition.
- **Tone & Length Customization**: Tailor emails to be Professional, Casual, Friendly, Formal, or Persuasive.
- **Firebase Auth**: Secure registration, login, and robust session management.
- **Firestore DB**: Save generated emails and view your personal history.
- **Serverless First**: Robust backend powered strictly by Next.js Server Actions with strict Zod validation to eliminate injection vulnerabilities.
- **Premium Upgrades**: A fully responsive pricing page showcasing our Pro tier.

## 🛠️ Tech Stack
- **Framework**: Next.js (App Router) & React 19
- **Authentication**: Firebase Auth (Client-side sync) & Firebase Admin (Server-side validation)
- **Database**: Firestore
- **AI Provider**: Google Gemini 2.5 Flash (`@google/generative-ai`)
- **Styling**: Tailwind CSS v4 + shadcn/ui + Lucide React
- **Validation**: Zod & React Hook Form
- **Testing**: Vitest

## 🏗️ Architectural Decisions
1. **Serverless-First & Server Actions**: All backend logic (database writes, AI calls) is orchestrated entirely through Next.js Server Actions. To guarantee security and prevent IDOR, every Action receives a Firebase `idToken` from the client and cryptographically verifies it via `firebase-admin` before executing business logic.
2. **Strict Zod Validation**: The backend completely protects itself from malformed data and prompt-injection by aggressively validating incoming server action payloads with strict Zod schemas (`emailRequestSchema`), refusing to pass unvalidated strings to the Gemini LLM.
3. **AI Factory Pattern (Mock vs Live)**: The AI service implements a robust Strategy/Factory pattern. By setting `AI_PROVIDER=mock` in `.env.local`, the application seamlessly swaps the live Gemini API for a deterministic Mock service. This guarantees unblocked local development and CI/CD testing without exhausting Google Free Tier rate limits.

## 💻 How to Run Locally

### 1. Environment Setup
Create a `.env.local` file in the root directory and populate it with your Firebase and Gemini credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="..."

GEMINI_API_KEY=...
AI_PROVIDER=gemini # Or 'mock' for local offline development
```

### 2. Standard NPM Install
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Docker Setup
To run the application entirely within an isolated Docker container without relying on a local Node installation:
```bash
docker compose up --build
```
The app will automatically serve on port `3000`.

## 🧪 Testing and Quality Assurance
Run the automated Vitest test suite to validate the AI Architecture and rate-limit handling:
```bash
npm run test
```

Run the manual live API stress test to gauge current Google API rate limits across varying tones:
```bash
npm run stress-test
```
