// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { detectCrisis, AIPrompts, detectIssue } from "@/lib/prompts";
import { AIPromptKey, AIResponse, TriageAnswers } from "@/lib/type";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body: TriageAnswers = await req.json();
    const { feeling, suicidal, supportNearby, mood } = body;

    console.log("[Server] /api/analyze called. Body:", JSON.stringify(body));

    // Validation
    if (!feeling || feeling.trim().length === 0) {
      return NextResponse.json(
        { error: "Vui lòng nhập cảm giác của bạn" },
        { status: 400 }
      );
    }

    // Crisis detection
    if (suicidal === "yes" || detectCrisis(feeling)) {
      const crisisResponse: AIResponse = {
        type: "crisis",
        message:
          "Mình rất lo cho an toàn của bạn. Nếu bạn đang gặp nguy hiểm, hãy gọi 115 (cấp cứu) hoặc 113 (cảnh sát).",
      };
      return NextResponse.json(crisisResponse);
    }

    // Generate prompt
    const issue = detectIssue(feeling);
    console.log("[Server] Detected issue:", issue);
    console.log("[Server] Available AIPrompts keys:", Object.keys(AIPrompts));

    const issueKey = (
      issue && typeof issue === "string" && issue in AIPrompts
        ? issue
        : "general"
    ) as AIPromptKey;

    console.log("[Server] Selected issueKey:", issueKey);

    // CRITICAL: Check if prompt template exists
    const promptTemplate = AIPrompts[issueKey];
    
    if (!promptTemplate || typeof promptTemplate !== "string") {
      console.error(`[Server] ERROR: AIPrompts['${issueKey}'] is undefined or not a string`);
      console.error("[Server] AIPrompts object:", JSON.stringify(AIPrompts, null, 2));
      
      return NextResponse.json(
        { error: `Missing prompt template for: ${issueKey}` },
        { status: 500 }
      );
    }

    console.log("[Server] Prompt template found, length:", promptTemplate.length);

    // Build full prompt
    const fullPrompt = promptTemplate
      .replace("{feeling}", feeling)
      .replace("{mood}", mood.toString())
      .replace(
        "{supportStatus}",
        supportNearby === "alone" ? "đang ở một mình" : "có người bên cạnh"
      );

    console.log("[Server] Full prompt:", fullPrompt);

    // Check API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Server] Missing OPENAI_API_KEY");
      return NextResponse.json(
        { error: "Server configuration error: Missing API key" },
        { status: 500 }
      );
    }

    console.log("[Server] API key found, calling OpenAI...");

    // Call OpenAI
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.9,
          messages: [
            {
              role: "system",
              content: `Bạn là chuyên gia tâm lý AI. LUÔN trả về JSON hợp lệ theo schema:
{
  "type": "normal",
  "emotion": "sad"|"stressed"|"hopeful"|"lost"|"anxious",
  "empathy": "...",
  "advice": "...",
  "actions": ["...", "...", "..."],
  "quote": "...",
  "detectedIssue": "..."
}
Không thêm văn bản nào ngoài JSON. Viết ngắn gọn bằng tiếng Việt.`,
            },
            { role: "user", content: fullPrompt },
          ],
        }),
      }
    );

    const openaiRaw = await openaiResponse.text();
    console.log("[Server] OpenAI status:", openaiResponse.status);
    console.log("[Server] OpenAI raw response:", openaiRaw.substring(0, 200));

    if (!openaiResponse.ok) {
      console.error("[Server] OpenAI error:", openaiRaw);
      return NextResponse.json({ error: "OpenAI API error" }, { status: 502 });
    }

    // Parse OpenAI response
    let openaiJson: any;
    try {
      openaiJson = JSON.parse(openaiRaw);
    } catch (err) {
      console.error("[Server] Failed to parse OpenAI JSON:", err);
      return NextResponse.json(
        { error: "Invalid OpenAI response" },
        { status: 502 }
      );
    }

    const content: string =
      openaiJson?.choices?.[0]?.message?.content ?? "";

    console.log("[Server] OpenAI content:", content.substring(0, 200));

    // Clean and parse AI response
    const cleaned = content.replace(/```json\n?|```/g, "").trim();

    let parsedResponse: AIResponse;
    try {
      parsedResponse = JSON.parse(cleaned);
      console.log("[Server] Successfully parsed AI response");
    } catch (err) {
      console.error("[Server] Failed to parse AI JSON:", err);
      console.error("[Server] Cleaned content:", cleaned);
      
      // Fallback response
      parsedResponse = {
        type: "normal",
        emotion: "hopeful",
        empathy: "Mình hiểu bạn đang gặp khó khăn. Cảm ơn bạn đã chia sẻ.",
        advice: "Hãy dành thời gian nghỉ ngơi và chăm sóc bản thân.",
        actions: ["Hít thở sâu 3 lần", "Uống nước", "Gọi cho người thân"],
        quote: "Mọi chuyện rồi sẽ qua",
        detectedIssue: issue || "Hỗ trợ tổng quát",
      };
    }

    parsedResponse.detectedIssue = issue;
    return NextResponse.json(parsedResponse);
    
  } catch (error) {
    console.error("[Server] CRITICAL ERROR:", error);
    console.error("[Server] Error stack:", error instanceof Error ? error.stack : "No stack");
    
    // Return fallback
    const fallback: AIResponse = {
      type: "normal",
      emotion: "hopeful",
      empathy: "Tôi hiểu bạn đang gặp khó khăn. Cảm ơn bạn đã chia sẻ.",
      advice: "Đôi khi cuộc sống mang đến thử thách, nhưng mỗi thử thách là cơ hội trưởng thành.",
      actions: [
        "Hít thở sâu 3 lần",
        "Viết ra 3 điều tốt đẹp",
        "Gọi điện cho người thân",
      ],
      quote: "Sau cơn mưa trời lại sáng",
      detectedIssue: "Hỗ trợ tổng quát",
    };
    return NextResponse.json(fallback);
  }
}