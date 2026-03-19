# **App Name**: ILMNOOR

## Core Features:

- Essential Overview Dashboard: A clean, mobile-first dashboard displaying today's Hijri date, current prayer time, and countdowns for Sehri/Iftar, with prominent navigation cards to all app sections.
- Interactive Quran Browser: Provides access to all 114 Surahs, displaying each Ayah with Arabic text (Amiri font), Roman English transliteration, and Urdu translation. Includes an integrated audio player for individual Ayahs from external APIs.
- Personalized Quran Progress Tracker: Allows users to mark individual Surah progress as 'Not Started', 'Learning', or 'Completed'. Visualizes overall Quran completion with a percentage progress bar, saving all data locally within the browser.
- Guided Recitation Comparison Tool: Enables users to record their Quran recitation for each Ayah using the browser's MediaRecorder API. An intelligent tool compares the user's audio against original recitation (via Web Audio API) for rhythm and timing, providing a score and encouraging feedback.
- Personal Dua Notepad: A personal space where users can type, save, edit, delete, and mark as favorite their own Duas. Each Dua card displays its title, text, and creation date, with local search/filter capabilities, all stored in localStorage.
- Dynamic Prayer & Ramadan Times: Automatically detects user location via Geolocation API (with manual input fallback) to fetch and display accurate prayer, Sehri, and Iftar times. Features a live countdown to the next prayer/meal and configurable browser notification alarms for each prayer and meal time.
- Interactive Islamic Calendar: Displays the current Hijri (Islamic) and Gregorian dates. Includes a monthly Hijri calendar view that highlights important Islamic observances and holidays (e.g., Ramadan, Eid, Ashura) using external API data.

## Style Guidelines:

- Background color: Deep forest green (#1A472A), reflecting tradition and nature. (HSL: 141, 48%, 20%)
- Primary color: Soft cream (#DAD7BF), offering excellent readability for text and providing an elegant contrast against the dark background. (HSL: 70, 20%, 75%)
- Accent color: Vibrant gold (#D4AF37), used for highlights, interactive elements, and key information, adding a regal and spiritual touch. (HSL: 45, 69%, 52%)
- Headlines and prominent text: 'Alegreya' (serif), chosen for its elegant and intellectual contemporary feel, suitable for an app focused on knowledge and reflection.
- Body text: 'PT Sans' (humanist sans-serif), providing a modern, warm, and highly readable typeface for extended content sections.
- Arabic text: 'Amiri' (serif), as specified, to ensure authentic and aesthetically pleasing display of the Quranic script.
- Icons should be refined and minimalist, drawing inspiration from Islamic geometric patterns, crescents, and stars, utilizing the gold accent color to subtly highlight their forms.
- Emphasize a mobile-first, responsive design with clear hierarchy and generous spacing to ensure readability and ease of use on all screen sizes, maintaining a 'clean dashboard' aesthetic for core navigation.
- Subtle and purposeful animations, such as smooth transitions between sections, gentle countdown timer updates, and elegant visual feedback on recording and progress interactions, enhancing the serene user experience.