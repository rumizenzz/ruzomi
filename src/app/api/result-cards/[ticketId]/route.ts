import { getResultCard } from "@/lib/paytocommit-data";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await params;
  const card = await getResultCard(ticketId);

  if (!card) {
    return new Response("Result card not found.", { status: 404 });
  }

  const accent = card.type === "completed" ? "#3af2ff" : "#ff6b9b";
  const title = escapeXml(card.title);
  const subtitle = escapeXml(card.subtitle);
  const summary = escapeXml(card.summary);
  const netResult = escapeXml(card.netResultLabel);
  const createdAt = escapeXml(card.createdAt);
  const header = card.type === "completed" ? "Victory verified" : "Forfeiture logged";
  const proofLabel = card.type === "completed" ? "STP final proof attached" : "Proof window missed";
  const footer = card.type === "completed" ? "Share to Ruzomi or save to your device." : "Saved to your result history and ready to share.";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628" fill="none">
      <rect width="1200" height="628" rx="36" fill="#03101D"/>
      <rect x="24" y="24" width="1152" height="580" rx="28" fill="url(#bg)" stroke="url(#frame)" stroke-width="2"/>
      <rect x="72" y="70" width="288" height="92" rx="24" fill="rgba(4,22,36,0.74)" stroke="rgba(255,255,255,0.12)"/>
      <rect x="96" y="92" width="50" height="50" rx="16" fill="url(#shield)" stroke="rgba(255,255,255,0.12)"/>
      <text x="111" y="126" fill="#EAFDFF" font-size="24" font-family="Arial, sans-serif" font-weight="700">PC</text>
      <text x="166" y="124" fill="#E9FBFF" font-size="34" font-family="Arial, sans-serif" font-weight="700">PayToCommit</text>
      <rect x="72" y="186" width="1056" height="82" rx="24" fill="rgba(5,20,30,0.76)" stroke="${accent}" stroke-width="2"/>
      <text x="104" y="236" fill="${accent}" font-size="30" font-family="Arial, sans-serif" font-weight="700">${escapeXml(header)}</text>
      <text x="884" y="236" fill="#D8F4FF" font-size="24" font-family="Arial, sans-serif">${escapeXml(proofLabel)}</text>
      <rect x="72" y="296" width="700" height="236" rx="28" fill="rgba(4,22,36,0.74)" stroke="rgba(255,255,255,0.1)"/>
      <text x="104" y="352" fill="#7EEFFF" font-size="56" font-family="Arial, sans-serif" font-weight="700">${title}</text>
      <text x="104" y="398" fill="#B6D4DE" font-size="28" font-family="Arial, sans-serif">${subtitle}</text>
      <text x="104" y="462" fill="#E7FBFF" font-size="32" font-family="Arial, sans-serif">${summary}</text>
      <text x="104" y="510" fill="#8CB1BD" font-size="24" font-family="Arial, sans-serif">Recorded ${createdAt}</text>
      <rect x="798" y="296" width="330" height="236" rx="28" fill="rgba(4,22,36,0.78)" stroke="rgba(255,255,255,0.1)"/>
      <circle cx="964" cy="388" r="88" fill="rgba(58,242,255,0.08)" stroke="${accent}" stroke-width="2"/>
      <circle cx="964" cy="388" r="54" fill="rgba(58,242,255,0.12)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
      <text x="923" y="402" fill="#F7FDFF" font-size="58" font-family="Arial, sans-serif" font-weight="700">${card.type === "completed" ? "V" : "F"}</text>
      <text x="846" y="476" fill="${accent}" font-size="54" font-family="Arial, sans-serif" font-weight="700">${netResult}</text>
      <text x="846" y="510" fill="#D7F7FF" font-size="24" font-family="Arial, sans-serif">Commitment Network recorded</text>
      <rect x="72" y="554" width="1056" height="50" rx="18" fill="rgba(5,20,30,0.78)" stroke="rgba(255,255,255,0.08)"/>
      <text x="104" y="586" fill="#D7F7FF" font-size="22" font-family="Arial, sans-serif">${escapeXml(footer)}</text>
      <text x="890" y="586" fill="#8CB1BD" font-size="20" font-family="Arial, sans-serif">Spark · Ruzomi · Commitment Network</text>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="628" gradientUnits="userSpaceOnUse">
          <stop stop-color="#061B30"/>
          <stop offset="0.55" stop-color="#061120"/>
          <stop offset="1" stop-color="#040C17"/>
        </linearGradient>
        <linearGradient id="frame" x1="24" y1="24" x2="1176" y2="604" gradientUnits="userSpaceOnUse">
          <stop stop-color="${accent}" stop-opacity="0.9"/>
          <stop offset="1" stop-color="rgba(255,255,255,0.18)"/>
        </linearGradient>
        <linearGradient id="shield" x1="96" y1="92" x2="146" y2="142" gradientUnits="userSpaceOnUse">
          <stop stop-color="#4EF3FF"/>
          <stop offset="1" stop-color="#3A7EFF"/>
        </linearGradient>
      </defs>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "content-disposition": `attachment; filename="paytocommit-result-${ticketId}.svg"`,
    },
  });
}
