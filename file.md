<task_context>
You are tasked with fixing frontend and backend issues, optimizing SSR performance, and implementing new features for a web application built with a NestJS backend.
</task_context>
1. **Authentication & Access Control**
* **Route Guarding:** Prevent authenticated users from accessing the login or signup pages (redirect them to the dashboard/home directly).
2. **UI Flash / Hydration Glitches (SSR Optimization)**
* Eliminate the visual flicker/glitch on initial page load (e.g., navbar displaying "Login/Signup" buttons briefly before switching to the logged-in state).
* Fix delayed loading states and slow rendering across the dashboard to ensure seamless Server-Side Rendering (SSR).
3. **Profile Modal & Requests**
* Fix the roommate connection request feature in the profile modal where nothing displays when a user attempts to accept or reject incoming roommate requests.
4. **Transactional Email System**
* Implement automated email functionality to send a professional welcome/onboarding email immediately after a user successfully signs up.
5. **Security & Account Management**
* Implement a secure "Change Password" feature under security settings on both the frontend (form, validation, states) and NestJS backend (secure endpoint, password verification, hashing).
6. **UI/UX Redesign**
* Redesign the "Matching Roommates" card component to be more compact, scannable, and visually appealing without losing key information.
<output_expectations>
* Provide clean, robust code implementations for both frontend and backend (NestJS).
* Include clear explanations of the root causes for the SSR flickering/hydration issues alongside the fixes.
</output_expectations>