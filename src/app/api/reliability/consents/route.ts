export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        subjectId?: string;
        scope?: string;
        status?: "granted" | "revoked";
      }
    | null;

  if (!body?.subjectId || !body.scope) {
    return Response.json(
      { error: "subjectId and scope are required" },
      { status: 400 },
    );
  }

  return Response.json({
    consent: {
      subjectId: body.subjectId,
      scope: body.scope,
      status: body.status ?? "granted",
      createdAt: new Date().toISOString(),
      auditId: crypto.randomUUID(),
    },
  });
}
