
console.info('python-executor started');

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Health check: GET returns 200
  if (req.method === 'GET' && (url.pathname === '/python-executor' || url.pathname === '/')) {
    return new Response(JSON.stringify({
      status: 'ok',
      function: 'python-executor'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });
  }

  if (req.method === 'POST') {
    let body = {};
    const contentType = req.headers.get('content-type');
    const contentLength = req.headers.get('content-length');

    try {
      if (contentLength === '0' || !contentType) {
        body = {}; // Handle empty body
      } else if (contentType.includes('application/json')) {
        body = await req.json();
      } else {
        // Fallback for non-JSON content types
        const text = await req.text();
        try {
          body = text ? JSON.parse(text) : {};
        } catch (_) {
          body = { text: text };
        }
      }
    } catch (e) {
      // Catch all parsing errors and return 400
      return new Response(JSON.stringify({
        error: 'Invalid or unparsable request body',
        details: String(e)
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        }
      });
    }

    // TODO: Implement actual python execution logic here with the parsed `body`
    // The original logic would go here. For now, it returns a placeholder response.
    return new Response(JSON.stringify({
      ok: true,
      function: 'python-executor',
      received: body,
      message: "Body parsing fixed. Placeholder for execution logic."
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });
  }

  return new Response(JSON.stringify({
    error: 'Method not allowed'
  }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'GET, POST',
      'Connection': 'keep-alive'
    }
  });
});
