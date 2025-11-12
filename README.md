# React Query Infinite Stream

High-performance infinite streaming feed built with Next.js 14, React 18, and TanStack Query v5 (`@tanstack/react-query`). Implements server-side cursor pagination, optimistic mutations, real-time cache reconciliation, and tag filtering.

## Key Features

- **TanStack Query v5 (`useInfiniteQuery`)**: Cursor-based infinite pagination with `getNextPageParam`.
- **Optimistic UI Updates**: Instant message publication with rollback handling on network faults.
- **Dynamic Tag Filter Stream**: Memory-efficient stream slicing by engineering domains.
- **Cache Revalidation**: Automated cache invalidation and background sync on filter switch.
- **Next.js App Router Architecture**: Server-side API route handler for cursor-driven feeds.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Production Build

```bash
npm run build
npm start
```
