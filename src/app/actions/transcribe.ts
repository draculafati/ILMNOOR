'use server';

export async function transcribeAudio(audioBase64: string) {
  const HF_TOKEN = process.env.HF_API_TOKEN;

  if (!HF_TOKEN) {
    return { error: "HF_API_TOKEN not found in server environment." };
  }

  try {
    const binaryStr = atob(audioBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/tarteel-ai/whisper-base-ar-quran",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "audio/wav",
        },
        body: bytes.buffer,
        signal: AbortSignal.timeout(30_000),
        cache: 'no-store',
      }
    );

    if (response.status === 503) {
      return { error: "503: AI model is warming up. Please try again in 30 seconds." };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HF API Error: ${response.status} - ${errorText}` };
    }

    const result = await response.json();
    return { text: result.text ?? "" };

  } catch (err) {
    console.error("Transcription error:", err);
    return { error: err instanceof Error ? err.message : "Unknown error during transcription" };
  }
}

export async function isHFServerConfigured() {
  return !!process.env.HF_API_TOKEN;
}