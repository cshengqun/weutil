// Vercel Serverless Function: Trend Radar aggregator
// Daily trend signals for one-person companies.
// Single-file plugin design: each source is an async function returning
// [{title, url, score?, sub?}]. Add a new source by:
//   1. writing another async function below
//   2. adding it to the SOURCES array
// The frontend renders whatever sources come back, no FE change needed.

const UA = 'WeUtil-TrendRadar/1.0 (+https://weutil.top)';

async function fetchText(url, { timeout = 8000, headers = {} } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json, text/html;q=0.9', ...headers },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

// ---------- Source 1: GitHub Trending (daily, all languages) ----------
async function githubTrending() {
  const html = await fetchText('https://github.com/trending?since=daily');
  const out = [];
  // Split on each article block
  const blocks = html.split('<article class="Box-row">').slice(1);
  for (const block of blocks) {
    const mRepo = block.match(/<h2[^>]*>\s*<a[^>]*href="([^"]+)"/);
    if (!mRepo) continue;
    const repo = mRepo[1].trim().replace(/^\//, '');
    const mDesc = block.match(/<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/);
    const desc = mDesc ? mDesc[1].replace(/<[^>]+>/g, '').trim() : '';
    const mStars = block.match(/href="\/[^"]+\/stargazers"[^>]*>\s*([\d,]+)/);
    const stars = mStars ? parseInt(mStars[1].replace(/,/g, ''), 10) : 0;
    const mToday = block.match(/([\d,]+)\s*stars\s*today/i);
    const today = mToday ? parseInt(mToday[1].replace(/,/g, ''), 10) : 0;
    out.push({
      title: repo,
      url: 'https://github.com/' + repo,
      score: today,
      sub: desc || ('★ ' + stars.toLocaleString()),
    });
    if (out.length >= 10) break;
  }
  return out;
}

// ---------- Source 2: Hacker News (top stories, filter Show HN / high score) ----------
async function hackerNews() {
  const ids = JSON.parse(await fetchText('https://hacker-news.firebaseio.com/v0/topstories.json')).slice(0, 40);
  const items = await Promise.all(ids.slice(0, 30).map(async id => {
    try {
      return JSON.parse(await fetchText(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 5000 }));
    } catch { return null; }
  }));
  return items
    .filter(i => i && i.title && (i.score >= 120 || /show hn/i.test(i.title)))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(i => ({
      title: i.title,
      url: i.url || `https://news.ycombinator.com/item?id=${i.id}`,
      score: i.score,
      sub: (i.descendants || 0) + ' comments',
    }));
}

// ---------- Source 3: Lobsters (hottest developer links) ----------
async function lobsters() {
  const arr = JSON.parse(await fetchText('https://lobste.rs/hottest.json'));
  return arr.slice(0, 10).map(s => ({
    title: s.title,
    url: s.url || s.comments_url,
    score: s.score || 0,
    sub: (s.comment_count || 0) + ' comments · ' + (s.tags || []).slice(0, 3).join(', '),
  }));
}

// ---------- Source 4: HuggingFace trending models (last 7 days likes) ----------
async function huggingface() {
  const arr = JSON.parse(await fetchText(
    'https://huggingface.co/api/models?sort=likes7d&direction=-1&limit=10'
  ));
  return arr.slice(0, 10).map(m => ({
    title: m.id,
    url: 'https://huggingface.co/' + m.id,
    score: m.likes || 0,
    sub: m.pipeline_tag || 'model',
  }));
}

// ---------- Source 5: arXiv cs.AI latest ----------
async function arxiv() {
  const xml = await fetchText(
    'http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=8'
  );
  const out = [];
  const entries = xml.split('<entry>').slice(1);
  for (const e of entries) {
    const mTitle = e.match(/<title>([\s\S]*?)<\/title>/);
    const mId = e.match(/<id>([\s\S]*?)<\/id>/);
    if (!mTitle || !mId) continue;
    out.push({
      title: mTitle[1].replace(/\s+/g, ' ').trim(),
      url: mId[1].trim(),
      score: 0,
      sub: 'cs.AI new',
    });
    if (out.length >= 8) break;
  }
  return out;
}

const SOURCES = [
  { id: 'github', name: 'GitHub Trending', icon: '🐙', fetch: githubTrending },
  { id: 'hn', name: 'Hacker News', icon: '📰', fetch: hackerNews },
  { id: 'lobsters', name: 'Lobsters', icon: '🦞', fetch: lobsters },
  { id: 'hf', name: 'Hugging Face', icon: '🤗', fetch: huggingface },
  { id: 'arxiv', name: 'arXiv cs.AI', icon: '🧪', fetch: arxiv },
];

export default async function handler(req, res) {
  const startedAt = new Date();
  const results = await Promise.allSettled(
    SOURCES.map(async s => {
      const items = await s.fetch();
      return { id: s.id, name: s.name, icon: s.icon, items, ok: true };
    })
  );

  const sources = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return { id: SOURCES[i].id, name: SOURCES[i].name, icon: SOURCES[i].icon, items: [], ok: false, error: String(r.reason && r.reason.message || r.reason) };
  });

  const body = {
    generatedAt: startedAt.toISOString(),
    generatedAtLocal: startedAt.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }),
    sources,
  };

  // CDN cache 24h; stale-while-revalidate lets the next request refresh in background.
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).json(body);
}
