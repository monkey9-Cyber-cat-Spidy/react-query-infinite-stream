import { NextResponse } from 'next/server';

const MOCK_POSTS = Array.from({ length: 120 }).map((_, i) => ({
  id: `post_${i + 1}`,
  author: `Engineer #${(i % 12) + 1}`,
  handle: `@dev_${(i % 12) + 1}`,
  avatar: `https://images.unsplash.com/photo-${1534528741775 + (i % 20)}?w=100&h=100&fit=crop&crop=face`,
  content: `Distributed systems note #${i + 1}: Optimizing PostgreSQL partition queries and WAL replication for sub-10ms read latencies at high scale.`,
  tag: ['PostgreSQL', 'Architecture', 'Next.js', 'Distributed'][i % 4],
  likes: Math.floor(Math.sin(i + 1) * 40 + 50),
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
}));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = parseInt(searchParams.get('cursor') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const tag = searchParams.get('tag') || 'All';

  let filtered = MOCK_POSTS;
  if (tag !== 'All') {
    filtered = filtered.filter(p => p.tag === tag);
  }

  const items = filtered.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < filtered.length ? cursor + limit : null;

  return NextResponse.json({
    items,
    nextCursor,
    total: filtered.length
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const newPost = {
    id: `post_${Date.now()}`,
    author: 'You (Satya)',
    handle: '@kvsmanikanta',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    content: body.content || 'New engineering update published to stream.',
    tag: body.tag || 'Architecture',
    likes: 0,
    timestamp: new Date().toISOString()
  };
  return NextResponse.json(newPost, { status: 201 });
}
