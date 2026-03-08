import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
        JSON.stringify({ error: "Daily AI Coach limit reached (10 messages/day). Come back tomorrow! 🌅", remaining: 0 }),
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

    // Process AI request
    const { userData, messages: chatMessages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const contextMessage = `Here's the user's current productivity data:\n${JSON.stringify(userData, null, 2)}`;

    let messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
      { role: "system", content: contextMessage },
    ];

    if (mode === "chat" && chatMessages?.length) {
      messages = [...messages, ...chatMessages];
    } else {
      messages.push({
        role: "user",
        content: "Based on my productivity data, give me personalized coaching tips for today.",
      });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
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
