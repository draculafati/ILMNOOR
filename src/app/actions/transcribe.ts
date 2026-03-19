'use server';

/**
 * Server action to handle audio transcription via Hugging Face Inference API.
 * This keeps the API token secure on the server.
 */

export async function transcribeAudio(audioBase64: string, clientToken?: string) {
  const serverToken = process.env.VITE_HF_TOKEN;
  const token = serverToken || clientToken;

  if (!token) {
    throw new Error("Hugging Face token not configured. Please add it to your .env file or Settings.");
  }

  try {
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    const response = await fetch("https://api-inference.huggingface.co/models/tarteel-ai/whisper-base-ar-quran", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "audio/wav"
      },
      body: audioBuffer
    });

    if (response.status === 503) {
      return { loading: true };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `API Error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    return { text: data.text || "" };
  } catch (err) {
    console.error("Transcription error:", err);
    return { error: err instanceof Error ? err.message : "Unknown error during transcription" };
  }
}

export async function isHFServerConfigured() {
  return !!process.env.VITE_HF_TOKEN;
}
