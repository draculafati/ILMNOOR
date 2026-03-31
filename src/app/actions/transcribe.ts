'use server';

export async function transcribeAudio(audioBase64: string) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return { error: "GROQ_API_KEY not found in server environment." };
  }

  try {
    // base64 ko binary blob mein convert karo
    const binaryStr = atob(audioBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // FormData banao — Groq multipart expect karta hai
    const formData = new FormData();
    const audioBlob = new Blob([bytes], { type: 'audio/wav' });
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'ar');
    formData.append('response_format', 'json');

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
        signal: AbortSignal.timeout(30_000),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      return { error: `Groq API Error: ${response.status} - ${errorText}` };
    }

    const result = await response.json();
    console.log("Transcription result:", result);
    return { text: result.text ?? "" };

  } catch (err) {
    console.error("Transcription error:", err);
    return { error: err instanceof Error ? err.message : "Unknown error during transcription" };
  }
}

export async function isHFServerConfigured() {
  return !!process.env.GROQ_API_KEY;
}