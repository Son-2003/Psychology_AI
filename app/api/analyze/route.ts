// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  detectCrisis,
  AIPrompts,
  detectIssue,
} from "@/lib/prompts";
import { AIPromptKey, AIResponse, TriageAnswers } from "@/lib/type";

export const runtime = "nodejs"; // dùng node runtime để fetch external an toàn

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

    const issueKey = (
      issue && typeof issue === "string" && issue in AIPrompts
        ? issue
        : "general"
    ) as AIPromptKey;

    const fullPrompt = AIPrompts[issueKey]
      .replace("{feeling}", feeling)
      .replace("{mood}", mood.toString())
      .replace(
        "{supportStatus}",
        supportNearby === "alone" ? "đang ở một mình" : "có người bên cạnh"
      );

    console.log("[Server] Using issue:", issue);
    console.log("[Server] Full prompt:", fullPrompt);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Server] Missing OPENAI_API_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

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
              content: `
Bạn là một chuyên gia tâm lý AI. LUÔN TRẢ VỀ JSON HỢP LỆ theo schema:
{
  "type":"normal"|"crisis",
  "emotion":"sad"|"stressed"|"hopeful"|"lost"|"anxious",
  "empathy":"...",
  "advice":"...",
  "actions":["...","...","..."],
  "quote":"...",
  "detectedIssue":"..."
}
Không thêm bất kỳ văn bản nào ngoài JSON. Viết ngắn gọn, bằng tiếng Việt.
            `,
            },
            { role: "user", content: fullPrompt },
          ],
        }),
      }
    );

    // đọc **một lần** raw text để debug an toàn
    const openaiRaw = await openaiResponse.text();
    console.log("[Server] OpenAI status:", openaiResponse.status);
    console.log("[Server] OpenAI raw response:", openaiRaw);

    if (!openaiResponse.ok) {
      // nếu OpenAI trả lỗi, log và trả về lỗi 502
      console.error("[Server] OpenAI error body:", openaiRaw);
      return NextResponse.json({ error: "OpenAI API error" }, { status: 502 });
    }

    // parse OpenAI JSON (response envelope)
    let openaiJson: any;
    try {
      openaiJson = JSON.parse(openaiRaw);
    } catch (err) {
      console.error("[Server] Failed to parse OpenAI JSON envelope:", err);
      // trả fallback hoặc lỗi
      return NextResponse.json(
        { error: "Invalid response from OpenAI" },
        { status: 502 }
      );
    }

    // trích message content từ envelope (chat/completions)
    const content: string =
      openaiJson?.choices?.[0]?.message?.content ??
      openaiJson?.choices?.[0]?.text ??
      "";

    console.log("[Server] OpenAI message content:", content);

    // gỡ markdown nếu có
    const cleaned = content.replace(/```json\n?|```/g, "").trim();

    // cố parse JSON do model gửi (đây là JSON ứng với schema bạn yêu cầu)
    let parsedResponse: AIResponse;
    try {
      parsedResponse = JSON.parse(cleaned);
    } catch (err) {
      console.error("[Server] Failed to parse AI content as JSON:", err);
      console.error("[Server] Cleaned content:", cleaned);
      // fallback nhẹ: đưa content thô vào empathy để frontend hiển thị
      parsedResponse = {
        type: "normal",
        empathy: cleaned.slice(0, 300),
        advice: "Mình nghĩ bạn nên nghỉ ngơi một chút và chăm sóc bản thân.",
        actions: ["Hít thở sâu", "Uống nước", "Gọi cho người thân"],
        quote: "Mọi chuyện rồi sẽ qua",
        detectedIssue: issue || "Hỗ trợ tổng quát",
      };
    }

    parsedResponse.detectedIssue = issue;
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("[Server] API Error:", error);
    const fallback: AIResponse = {
      type: "normal",
      emotion: "hopeful",
      empathy: "Tôi hiểu bạn đang gặp khó khăn. Cảm ơn bạn đã chia sẻ.",
      advice:
        "Đôi khi cuộc sống mang đến thử thách, nhưng mỗi thử thách là cơ hội trưởng thành.",
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
