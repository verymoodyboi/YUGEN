// workers/transcode/util/qencode.status.ts
export async function getQencodeStatus(token: string, taskToken: string) {
  const res = await fetch("https://api.qencode.com/v1/status", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token,
      task_tokens: taskToken,
    }),
  });

  const json = (await res.json()) as any;

  if (json.error) {
    throw new Error(`Qencode status error: ${json.message || json.error}`);
  }

  return json.statuses?.[taskToken];
}
