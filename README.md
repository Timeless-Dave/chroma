# /dev/color RAG Chatbot

A full-stack Retrieval-Augmented Generation (RAG) web app built with Next.js, TypeScript, and Tailwind CSS for the Gates R&D Hackathon Technical Assessment.

This project intentionally avoids heavy frameworks like LangChain. It uses the OpenAI API for embeddings and generation, while implementing document chunking and cosine-similarity search in plain TypeScript.

## Prerequisites

- Node.js 18+
- An OpenAI API key

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and add your API key:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the chat interface.

## Deploy on Vercel

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add `OPENAI_API_KEY` in the project environment variables.
4. Deploy.

The corpus embeddings are cached in memory on first request and reused across warm server instances.

## Project Structure

- `app/page.tsx` — Chat UI
- `app/api/chat/route.ts` — RAG API route
- `lib/chunking.ts` — FAQ loading and chunking
- `lib/similarity.ts` — Cosine similarity and retrieval
- `lib/corpus-cache.ts` — In-memory embedding cache
- `lib/openai.ts` — OpenAI client helpers
- `devcolorfaq.txt` — FAQ corpus

## Sample Questions

- How can /dev/color help me develop my career?
- How can I contribute to /dev/color?
- In which cities is /dev/color located?
