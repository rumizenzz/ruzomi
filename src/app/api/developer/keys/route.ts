export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        name?: string;
        scope?: string;
      }
    | null;

  if (!body?.name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  return Response.json({
    key: {
      name: body.name,
      scope: body.scope ?? "read:reliability",
      value: `ptc_key_${crypto.randomUUID().replaceAll("-", "")}`,
      issuedAt: new Date().toISOString(),
    },
  });
}
