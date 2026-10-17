export default async function handler(req: any, res: any) {
  try {
    const { handleApiRequest } = await import('../server/apiHandler');
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      if (!res.headersSent) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Endpoint not found' }));
      }
    }
  } catch (error: any) {
    console.error('Vercel API error:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: error?.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'production' ? error?.message : error?.stack,
        details: error?.toString(),
      }));
    }
  }
}
