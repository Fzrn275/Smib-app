// supabase/functions/ai-helper/index.ts
// Supabase Edge Function — AI Help (DFD Section 4.5 / P5.2)
//
// Receives the student's question + project context from aiService.js,
// calls Google Gemini API server-side, and returns { reply: "..." }.
//
// SECURITY: GEMINI_API_KEY is read from Deno.env — it never touches the client.
// Set it in: Supabase Dashboard → Project Settings → Edge Functions → Secrets.
//
// Deploy: supabase functions deploy ai-helper

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── HANDLER ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in Edge Function secrets.");
    }

    // ── Parse request ────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const {
      project_id,
      step_id,
      step_title,
      learner_name,
      grade_level,
      message,
    } = body as {
      project_id?:   string;
      step_id?:      string;
      step_title?:   string;
      learner_name?: string;
      grade_level?:  string;
      message?:      string;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return json({ error: "message is required and must be a non-empty string." }, 400);
    }

    // ── Build system prompt ──────────────────────────────────────────────────
    const isJunior  = grade_level === "junior_learner";
    const gradeDesc = isJunior
      ? "a primary or early secondary school student — use simple language, short sentences, lots of encouragement"
      : "a secondary or pre-university student — you can use more technical terms but keep it clear";

    const contextLines = [
      step_title  ? `Current step: "${step_title}"` : null,
      project_id  ? `Project ID: ${project_id}`     : null,
    ].filter(Boolean).join("\n");

    const systemPrompt = [
      `You are the S-MIB AI Helper — a friendly STEM tutor for students in Sarawak, Malaysia.`,
      `You are helping ${learner_name || "a student"}, who is ${gradeDesc}.`,
      contextLines ? `\nContext:\n${contextLines}` : "",
      `\nGuidelines:`,
      `- Respond in English. You may occasionally include common Bahasa Malaysia words to feel familiar.`,
      `- Keep answers concise: 3-5 sentences for simple questions, longer only if a step-by-step is needed.`,
      `- Junior learners: use analogies and very simple words. Senior learners: slightly more technical.`,
      `- Always be encouraging and positive — STEM can be hard but you make it fun.`,
      `- If the question is completely unrelated to STEM, the project, or learning, politely redirect.`,
      `- Never produce harmful, offensive, or politically sensitive content.`,
    ].join("\n");

    // ── Call Gemini API ──────────────────────────────────────────────────────
    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\nStudent question: ${message.trim()}` },
          ],
        },
      ],
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 512,
        topP:            0.9,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error ${geminiRes.status}: ${errText}`);
    }

    const geminiData = await geminiRes.json();

    // ── Extract reply ────────────────────────────────────────────────────────
    const reply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ??
      geminiData?.candidates?.[0]?.output ?? // older response shape
      null;

    if (!reply || typeof reply !== "string") {
      throw new Error("Gemini returned an empty or unrecognised response.");
    }

    return json({ reply: reply.trim() }, 200);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[ai-helper]", message);
    return json({ error: message }, 500);
  }
});

// ─── HELPER ──────────────────────────────────────────────────────────────────

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
