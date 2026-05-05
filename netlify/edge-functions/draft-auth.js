// Basic Auth gate for /blog/draft/* — runs on Netlify Edge.
// Configure DRAFT_USER and DRAFT_PASSWORD as environment variables in the
// Netlify dashboard. If either is unset, all draft requests are denied.

export default async (request, context) => {
  const user = Netlify.env.get('DRAFT_USER');
  const password = Netlify.env.get('DRAFT_PASSWORD');

  if (!user || !password) {
    return new Response('Drafts disabled: credentials not configured.', {
      status: 503,
    });
  }

  const header = request.headers.get('Authorization') ?? '';
  if (header.startsWith('Basic ')) {
    const decoded = atob(header.slice(6));
    const sep = decoded.indexOf(':');
    if (sep !== -1) {
      const providedUser = decoded.slice(0, sep);
      const providedPassword = decoded.slice(sep + 1);
      if (providedUser === user && providedPassword === password) {
        return context.next();
      }
    }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Drafts", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
};

export const config = {
  path: '/blog/draft/*',
};
