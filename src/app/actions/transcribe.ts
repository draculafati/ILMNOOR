'use server';

/**
 * Server action to handle audio transcription via Tarteel AI's Hugging Face Space.
 * This approach uses the dedicated Space API for more accurate Quranic transcription.
 */

export async function transcribeAudio(audioBase64: string) {
  try {
    // Calling the Tarteel AI Whisper Space API directly
    const response = await fetch(
      "https://tarteel-ai-demo-whisper-base-ar-quran.hf.space/run/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [
            {
              name: "audio.wav",
              data: `data:audio/wav;base64,${audioBase64}`
            }
          ]
        }),
        cache: 'no-store'
      }
    );

    if (response.status === 503) {
      return { error: "503: AI Service is currently warming up or sleeping. Please try again in 30 seconds." };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `Space API Error: ${response.status} - ${errorText}` };
    }

    const result = await response.json();
    
    // The Tarteel Space API returns data as an array, where index 0 is the transcription text
    const transcriptionText = result.data?.[0] || "";
    
    return { text: transcriptionText };
  } catch (err) {
    console.error("Transcription error:", err);
    return { error: err instanceof Error ? err.message : "Unknown error during transcription" };
  }
}

export async function isHFServerConfigured() {
  // Since we are using a public space API for this specific model, we don't strictly require a token
  // unless the space becomes private. We'll return true to allow the UI to proceed.
  return true;
}
