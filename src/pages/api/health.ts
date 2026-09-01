export const prerender = false;

export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'adopt-a-run-api',
      mode: 'ssr-endpoint',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
