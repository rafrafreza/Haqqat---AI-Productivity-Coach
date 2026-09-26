import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DAILY_LIMIT = 10;

const systemPrompt = `You are Haqqat's AI Productivity Coach — a warm, insightful, and action-oriented mentor. You analyze the user's real productivity data and provide personalized, specific advice.

Your style:
- Friendly but direct — like a supportive coach, not a generic chatbot
- Use the user's actual data to make points (reference specific numbers)
- Give concrete, actionable advice
- Celebrate wins genuinely but briefly
- Be honest about areas needing improvement
- Use emoji sparingly for warmth
- Format with markdown: use **bold** for key points, bullet lists for tips

When giving initial coaching (no prior messages), structure your response:
1. **Quick Win** — Start with something positive from their data
2. **Focus Areas** — 2-3 specific improvements based on patterns
3. **Today's Challenge** — One concrete thing to try today
Keep initial coaching under 400 words.

When in conversation mode (follow-up questions), be concise and focused on the specific question. Keep replies under 200 words unless the user asks for more detail.`;

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate the user's JWT
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for usage tracking (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date().toISOString().slice(0, 10);

    // Check current usage
    const { data: usageRow } = await supabaseAdmin
      .from("ai_coach_usage")
      .select("message_count")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .maybeSingle();

    const currentCount = usageRow?.message_count ?? 0;
    const remaining = DAILY_LIMIT - currentCount;

    if (remaining <= 0) {
      return new Response(
        JSON.stringify({ error: "Daily AI Coach limit reached (10 messages/day). Come back tomorrow!", remaining: 0 }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment usage
    if (usageRow) {
      await supabaseAdmin
        .from("ai_coach_usage")
        .update({ message_count: currentCount + 1, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("usage_date", today);
    } else {
      await supabaseAdmin
        .from("ai_coach_usage")
        .insert({ user_id: user.id, usage_date: today, message_count: 1 });
    }

    const newRemaining = remaining - 1;

    // Parse request body
    const { userData, messages: chatMessages, mode } = await req.json();

    // Get Gemini API key
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const contextMessage = `Here's the user's current productivity data:\n${JSON.stringify(userData, null, 2)}`;

    // Build message history (Gemini only allows user/model roles)
    let userMessages: Array<{ role: string; content: string }> = [];
    if (mode === "chat" && chatMessages?.length) {
      userMessages = chatMessages;
    } else {
      userMessages = [{
        role: "user",
        content: "Based on my productivity data, give me personalized coaching tips for today.",
      }];
    }

    const contents = userMessages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Call Gemini non-streaming — most reliable in Deno edge functions
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: `${systemPrompt}\n\n${contextMessage}` }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini error:", geminiResponse.status, errText);
      if (geminiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `AI error: ${geminiResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("Empty Gemini response:", JSON.stringify(geminiData));
      throw new Error("No response from AI");
    }

    // Wrap in SSE format so the frontend reader works unchanged
    const encoder = new TextEncoder();
    const chunk = { choices: [{ delta: { content: text }, finish_reason: null }] };
    const sseBody = `data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`;

    return new Response(encoder.encode(sseBody), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Remaining-Messages": String(newRemaining),
      },
    });

  } catch (e) {
    console.error("coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
