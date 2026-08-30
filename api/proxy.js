// Vercel Serverless Function: HTTP proxy for WeUtil HTTP Client
// Solves browser CORS by forwarding requests server-side.
// Includes SSRF protection, timeout, and size limits.

const TIMEOUT_MS = 15000;
const MAX_RESPONSE_BYTES = 10 * 1024 * 1024; // 10 MB

// Block private / internal IP ranges to prevent SSRF
const BLOCKED_NETWORKS = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // CGNAT
];

function isBlockedHost(hostname) {
  if (!hostname) return true;
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.local') || lower.endsWith('.internal')) return true;
  // Simple IP check (will not catch DNS-resolved private IPs, but good enough for basic protection)
  for (const re of BLOCKED_NETWORKS) {
    if (re.test(lower)) return true;
  }
  return false;
}

function safeHeaders(headers) {
  const out = {};
  const blocked = ['host', 'content-length', 'connection', 'accept-encoding'];
  for (const [key, value] of Object.entries(headers || {})) {
    if (blocked.includes(key.toLowerCase())) continue;
    if (value === null || value === undefined || value === '') continue;
    out[key] = String(value);
  }
  return out;
}

export default async function handler(req, res) {
  // CORS headers for the proxy endpoint itself
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { method, url, headers, body } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "url" field.' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL.' });
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only http and https protocols are supported.' });
  }

  if (isBlockedHost(parsedUrl.hostname)) {
    return res.status(403).json({ error: 'Requests to private or internal addresses are blocked.' });
  }

  const httpMethod = (method || 'GET').toUpperCase();
  const safeMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(httpMethod)
    ? httpMethod
    : 'GET';

  const forwardHeaders = safeHeaders(headers);
  // Allow body on GET (non-standard but some APIs use it); HEAD must never have a body
  const hasBody = safeMethod !== 'HEAD' && body !== undefined && body !== null && body !== '';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startTime = Date.now();

  try {
    const fetchOptions = {
      method: safeMethod,
      headers: forwardHeaders,
      signal: controller.signal,
      redirect: 'follow',
    };

    if (hasBody) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const upstream = await fetch(url, fetchOptions);
    clearTimeout(timeout);

    // Read response body with size limit
    const reader = upstream.body.getReader();
    const chunks = [];
    let totalBytes = 0;
    let truncated = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.length;
      if (totalBytes > MAX_RESPONSE_BYTES) {
        truncated = true;
        break;
      }
      chunks.push(value);
    }
    await reader.cancel().catch(() => {});

    const responseBuffer = Buffer.concat(chunks);
    const responseText = responseBuffer.toString('utf8');

    // Collect response headers
    const respHeaders = {};
    upstream.headers.forEach((value, key) => {
      respHeaders[key] = value;
    });

    const elapsed = Date.now() - startTime;

    return res.status(200).json({
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
      body: responseText,
      bodySize: totalBytes,
      truncated,
      time: elapsed,
      url: upstream.url,
    });
  } catch (err) {
    clearTimeout(timeout);
    const elapsed = Date.now() - startTime;

    if (err.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timed out after ' + (TIMEOUT_MS / 1000) + ' seconds.',
        time: elapsed,
      });
    }

    return res.status(502).json({
      error: 'Failed to reach the target server: ' + (err.message || 'Unknown error'),
      time: elapsed,
    });
  }
}
