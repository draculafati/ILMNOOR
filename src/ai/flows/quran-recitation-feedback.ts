'use server';
/**
 * @fileOverview This file implements a Genkit flow for providing feedback on Quran recitation.
 *
 * - quranRecitationFeedback - A function that handles the Quran recitation feedback process.
 * - QuranRecitationFeedbackInput - The input type for the quranRecitationFeedback function.
 * - QuranRecitationFeedbackOutput - The return type for the quranRecitationFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the recitation feedback flow.
// It includes the recorded ayah's text, the comparison score,
// and any specific observations from client-side audio analysis.
const QuranRecitationFeedbackInputSchema = z.object({
  ayahText: z.string().describe('The Arabic text of the Quranic ayah recited by the user.'),
  score: z.number().min(0).max(100).describe('The comparison score (0-100) of the user\'s recitation against the original, derived from rhythm and timing analysis.'),
  userObservations: z.string().optional().describe('Optional textual observations from client-side audio analysis, describing specific areas for improvement (e.g., "timing was slightly off on the last word", "pronunciation of \'Qaaf\' was weak").'),
});
export type QuranRecitationFeedbackInput = z.infer<typeof QuranRecitationFeedbackInputSchema>;

// Output schema for the recitation feedback flow.
// It includes the encouraging message, the score category message,
// and specific actionable feedback for improvement.
const QuranRecitationFeedbackOutputSchema = z.object({
  scoreCategoryMessage: z.string().describe('An encouraging message based on the score category (e.g., "Mashallah! Perfect recitation!").'),
  detailedFeedback: z.string().describe('Specific, actionable feedback and recommendations for improving recitation, based on the provided score and observations.'),
});
export type QuranRecitationFeedbackOutput = z.infer<typeof QuranRecitationFeedbackOutputSchema>;

// Exported wrapper function to call the Genkit flow.
export async function quranRecitationFeedback(input: QuranRecitationFeedbackInput): Promise<QuranRecitationFeedbackOutput> {
  return quranRecitationFeedbackFlow(input);
}

// Define the prompt for generating recitation feedback.
const quranRecitationFeedbackPrompt = ai.definePrompt({
  name: 'quranRecitationFeedbackPrompt',
  input: {schema: QuranRecitationFeedbackInputSchema},
  output: {schema: QuranRecitationFeedbackOutputSchema},
  prompt: `You are an expert Quran recitation tutor focused on Tajweed (pronunciation) and timing.
You have been provided with a user's recitation score out of 100 and optional observations.
Your task is to provide encouraging and actionable feedback.

Based on the score, use the following categories for the 'scoreCategoryMessage':
- 90-100: "Mashallah! Perfect recitation!"
- 70-89: "Very good! Keep it up!"
- 50-69: "Good effort! Practice more."
- Below 50: "Keep practicing, you will improve!"

If 'userObservations' are provided, incorporate them into 'detailedFeedback' to give specific, actionable advice.
Always be encouraging and focus on improvement.

Here is the user's recitation data:
Ayah Recited: {{{ayahText}}}
Score: {{{score}}}
{{#if userObservations}}
Observations from audio analysis: {{{userObservations}}}
{{/if}}

Please provide the feedback in JSON format according to the output schema.`,
});

// Define the Genkit flow for Quran recitation feedback.
const quranRecitationFeedbackFlow = ai.defineFlow(
  {
    name: 'quranRecitationFeedbackFlow',
    inputSchema: QuranRecitationFeedbackInputSchema,
    outputSchema: QuranRecitationFeedbackOutputSchema,
  },
  async (input) => {
    const {output} = await quranRecitationFeedbackPrompt(input);
    if (!output) {
      throw new Error('Failed to generate recitation feedback.');
    }
    return output;
  }
);
