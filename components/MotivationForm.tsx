"use client";

import React, { useState } from "react";
import {
  Heart,
  Send,
  MessageCircle,
  Shield,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Brain,
  ChevronDown,
  Sparkles,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Users,
  Coffee,
  Music,
  BookOpen,
  Smile,
  Wind,
} from "lucide-react";
import { AIResponse, Stage, TriageAnswers } from "@/lib/type";

// Icon mapping cho từng emotion
const emotionIcons = {
  sad: CloudRain,
  stressed: Zap,
  anxious: Wind,
  lost: Cloud,
  hopeful: Sun,
};

// Color schemes cho từng emotion
const emotionColors = {
  sad: "from-blue-50 to-indigo-50",
  stressed: "from-orange-50 to-red-50",
  anxious: "from-purple-50 to-pink-50",
  lost: "from-gray-50 to-slate-50",
  hopeful: "from-yellow-50 to-amber-50",
};

// Icon suggestions cho actions
const actionIcons = [Coffee, Music, BookOpen, Users, Heart, Smile];

export default function MotivationForm() {
  const [stage, setStage] = useState<Stage>("form");
  const [answers, setAnswers] = useState<TriageAnswers>({
    feeling: "",
    suicidal: "no",
    supportNearby: "alone",
    mood: 5,
  });
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [expandedAction, setExpandedAction] = useState<number | null>(null);

  const handleSubmit = async () => {
    // console.log(answers);
    
    if (!answers.feeling.trim()) return;

    setLoading(true);
    setStage("loading");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      const rawText = await res.text();
      if (!res.ok) throw new Error(`API failed: ${rawText}`);

      const parsed: AIResponse = JSON.parse(rawText);
      setResponse(parsed);
      setStage("response");
    } catch (error) {
      console.error("Error:", error);
      setStage("form");
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStage("form");
    setAnswers({
      feeling: "",
      suicidal: "no",
      supportNearby: "alone",
      mood: 5,
    });
    setResponse(null);
    setCompletedActions([]);
    setExpandedAction(null);
  };

  const toggleAction = (index: number) => {
    setCompletedActions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getMoodLabel = (mood: number) => {
    if (mood <= 2) return "Rất khó khăn";
    if (mood <= 4) return "Khó khăn";
    if (mood <= 6) return "Ổn";
    if (mood <= 8) return "Tốt";
    return "Rất tốt";
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return "😔";
    if (mood <= 4) return "😕";
    if (mood <= 6) return "😐";
    if (mood <= 8) return "🙂";
    return "😊";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-purple-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        {/* Refined Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-rose-400 to-purple-500 rounded-3xl shadow-lg mb-4">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
            MindX Psychology
          </h1>
          <p className="text-gray-600 text-base sm:text-lg flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              AI hỗ trợ sức khỏe tinh thần
            </span>
            <span className="text-gray-400">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-green-500" />
              Bảo mật & Miễn phí
            </span>
          </p>
        </header>

        {/* Form Stage */}
        {stage === "form" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sm:p-10 space-y-8">
            {/* Main Input with gentle styling */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-500" />
                Bạn đang cảm thấy thế nào?
              </label>
              <div className="relative">
                <textarea
                  value={answers.feeling}
                  onChange={(e) =>
                    setAnswers({ ...answers, feeling: e.target.value })
                  }
                  placeholder="Hãy thoải mái chia sẻ những gì đang trăn trở trong lòng bạn... Mọi cảm xúc của bạn đều quan trọng và được chấp nhận."
                  className="w-full h-48 px-5 py-4 border-2 border-purple-200 rounded-2xl outline-none resize-none text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all text-base leading-relaxed"
                  maxLength={1000}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                  {answers.feeling.length}/1000
                </div>
              </div>
              {answers.feeling.length > 20 && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  Cảm ơn bạn đã chia sẻ, mình đang lắng nghe
                </div>
              )}
            </div>

            {/* Mood Slider - Prominent and visual */}
            <div className="space-y-4 p-6 bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl">
              <div className="flex justify-between items-center">
                <label className="text-base font-semibold text-gray-800">
                  Tâm trạng hiện tại
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getMoodEmoji(answers.mood)}</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {answers.mood}/10
                    </div>
                    <div className="text-xs text-gray-600">
                      {getMoodLabel(answers.mood)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative pt-2">
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={answers.mood}
                  onChange={(e) =>
                    setAnswers({ ...answers, mood: Number(e.target.value) })
                  }
                  className="w-full h-3 bg-white rounded-full appearance-none cursor-pointer shadow-inner"
                  style={{
                    background: `linear-gradient(to right, 
                      rgb(239, 68, 68) 0%, 
                      rgb(251, 146, 60) 25%, 
                      rgb(250, 204, 21) 50%, 
                      rgb(34, 197, 94) 75%, 
                      rgb(16, 185, 129) 100%)`,
                  }}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500 px-1">
                  <span>😔 Rất khó</span>
                  <span>😊 Rất tốt</span>
                </div>
              </div>
            </div>

            {/* Assessment Grid - Softer approach */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Suicidal - Sensitive language */}
              <div className="space-y-3">
                <label className="flex text-sm font-semibold text-gray-700 items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Có suy nghĩ tự hại không?
                </label>
                <div className="space-x-2 flex">
                  {[
                    {
                      value: "no",
                      label: "Không",
                      color:
                        "bg-green-50 border-green-300 text-green-700 hover:bg-green-100",
                    },
                    {
                      value: "unsure",
                      label: "Không chắc",
                      color:
                        "bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100",
                    },
                    {
                      value: "yes",
                      label: "Có",
                      color:
                        "bg-red-50 border-red-300 text-red-700 hover:bg-red-100",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setAnswers({ ...answers, suicidal: opt.value as any })
                      }
                      className={`w-full px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                        answers.suicidal === opt.value
                          ? "ring-4 ring-purple-200 border-purple-400 text-purple-400"
                          : opt.color
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Support */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Tình trạng hiện tại
                </label>
                <select
                  value={answers.supportNearby}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      supportNearby: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-sm text-purple-400 font-medium focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                >
                  <option value="alone">🏠 Đang một mình</option>
                  <option value="withSomeone">👥 Có người bên cạnh</option>
                  <option value="preferNotSay">🤐 Không muốn nói</option>
                </select>
              </div>
            </div>

            {/* Submit Button - More inviting */}
            <button
              onClick={handleSubmit}
              disabled={loading || !answers.feeling.trim()}
              className="w-full bg-linear-to-r from-rose-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-rose-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Nhận hỗ trợ từ AI
              <Send className="w-5 h-5" />
            </button>

            {/* Privacy Note - More reassuring */}
            <div className="flex items-start gap-3 text-sm text-gray-600 bg-green-50 p-4 rounded-xl border border-green-200">
              <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p>
                <strong className="text-green-700">100% Bảo mật:</strong> Thông
                tin của bạn được mã hóa end-to-end, không lưu trữ lâu dài và
                không chia sẻ với bên thứ ba.
              </p>
            </div>
          </div>
        )}

        {/* Loading Stage - More calming */}
        {stage === "loading" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 sm:p-16 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-linear-to-r from-rose-400 to-purple-500 rounded-full opacity-20 animate-ping"></div>
              <div className="relative bg-linear-to-br from-rose-400 to-purple-500 rounded-full w-full h-full flex items-center justify-center">
                <Brain className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Đang phân tích cảm xúc của bạn...
            </h3>
            <p className="text-gray-600 text-lg">
              AI đang chuẩn bị phản hồi tận tâm & chi tiết
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        )}

        {/* Response Stage */}
        {stage === "response" && response && (
          <div className="space-y-6">
            {response.type === "crisis" ? (
              /* Crisis Response - Clear but compassionate */
              <div className="bg-white rounded-3xl shadow-2xl border-4 border-red-400 overflow-hidden">
                <div className="bg-linear-to-r from-red-500 to-rose-500 p-8 text-white">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-bold">
                      Chúng mình lo lắng cho bạn
                    </h2>
                  </div>
                  <p className="text-lg leading-relaxed opacity-95">
                    Bạn đang trải qua giai đoạn rất khó khăn. Hãy để chuyên gia
                    hỗ trợ bạn ngay bây giờ - bạn không cần phải đối mặt với
                    điều này một mình.
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
                    Liên hệ ngay với các đường dây hỗ trợ
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a
                      href="tel:115"
                      className="flex flex-col items-center gap-3 p-6 bg-linear-to-br from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                        <Phone className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-3xl mb-1">115</div>
                        <div className="text-sm opacity-90">
                          Cấp cứu khẩn cấp
                        </div>
                      </div>
                    </a>

                    <a
                      href="tel:113"
                      className="flex flex-col items-center gap-3 p-6 bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                        <Shield className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-3xl mb-1">113</div>
                        <div className="text-sm opacity-90">
                          Cảnh sát hỗ trợ
                        </div>
                      </div>
                    </a>

                    <a
                      href="tel:18006003"
                      className="flex flex-col items-center gap-3 p-6 bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                        <Heart className="w-7 h-7" fill="white" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-2xl mb-1">18006003</div>
                        <div className="text-sm opacity-90">
                          The Leaf - Tư vấn
                        </div>
                      </div>
                    </a>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-center">
                    <p className="text-amber-900 font-medium">
                      ⏰ Đường dây hỗ trợ hoạt động 24/7. Đừng ngần ngại gọi
                      ngay bây giờ.
                    </p>
                  </div>

                  <button
                    onClick={resetAll}
                    className="w-full px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                  >
                    Quay lại trang chính
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Response - Visual and supportive */
              <div className="space-y-5">
                {/* Emotion header with visual indicator */}
                {response.emotion && (
                  <div
                    className={`bg-linear-to-r ${
                      emotionColors[response.emotion]
                    } rounded-3xl p-6 shadow-lg border border-white/50`}
                  >
                    <div className="flex items-center gap-4">
                      {React.createElement(
                        emotionIcons[response.emotion] || Brain,
                        {
                          className: "w-10 h-10 text-gray-700",
                        }
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-600 mb-1">
                          Phát hiện
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {response.detectedIssue}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empathy Card - Warm and understanding */}
                {response.empathy && (
                  <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-linear-to-br from-rose-400 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                        <Heart className="w-6 h-6 text-white" fill="white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Mình hiểu bạn đang cảm thấy vậy
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-base">
                          {response.empathy}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advice Card - Clear and actionable */}
                {response.advice && (
                  <div className="bg-white rounded-3xl shadow-lg border border-indigo-100 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-linear-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Phân tích & Lời khuyên
                      </h3>
                    </div>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                        {response.advice}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions Card - Visual and interactive */}
                {response.actions && response.actions.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        Hành động cụ thể
                      </h3>
                      <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                        <span className="text-2xl font-bold text-green-600">
                          {completedActions.length}
                        </span>
                        <span className="text-gray-600">/</span>
                        <span className="text-gray-600">
                          {response.actions.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {response.actions.map((action, idx) => {
                        const isCompleted = completedActions.includes(idx);
                        const isExpanded = expandedAction === idx;
                        const preview = action.slice(0, 100);
                        const needsExpand = action.length > 100;
                        const IconComponent =
                          actionIcons[idx % actionIcons.length];

                        return (
                          <div
                            key={idx}
                            className={`border-2 rounded-2xl overflow-hidden transition-all ${
                              isCompleted
                                ? "border-green-400 bg-green-50 shadow-md"
                                : "border-gray-200 bg-white hover:border-purple-300"
                            }`}
                          >
                            <div className="p-5">
                              <div className="flex items-start gap-4">
                                <button
                                  onClick={() => toggleAction(idx)}
                                  className={`w-10 h-10 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                                    isCompleted
                                      ? "bg-green-500 border-green-500 shadow-lg scale-110"
                                      : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                                  }`}
                                >
                                  {isCompleted && (
                                    <CheckCircle className="w-6 h-6 text-white" />
                                  )}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <IconComponent
                                      className={`w-5 h-5 ${
                                        isCompleted
                                          ? "text-green-600"
                                          : "text-gray-500"
                                      }`}
                                    />
                                    <span
                                      className={`text-xs font-semibold uppercase tracking-wide ${
                                        isCompleted
                                          ? "text-green-600"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Bước {idx + 1}
                                    </span>
                                  </div>
                                  <div
                                    className={`text-base leading-relaxed mb-2 ${
                                      isCompleted
                                        ? "text-green-900 font-medium"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {isExpanded ? action : preview}
                                    {needsExpand && !isExpanded && "..."}
                                  </div>

                                  {needsExpand && (
                                    <button
                                      onClick={() =>
                                        setExpandedAction(
                                          isExpanded ? null : idx
                                        )
                                      }
                                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                    >
                                      {isExpanded ? "Thu gọn" : "Xem đầy đủ"}
                                      <ChevronDown
                                        className={`w-4 h-4 transition-transform ${
                                          isExpanded ? "rotate-180" : ""
                                        }`}
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="bg-gray-100 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">
                          Tiến độ hoàn thành
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {Math.round(
                            (completedActions.length /
                              (response.actions?.length || 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-linear-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${
                              (completedActions.length /
                                (response.actions?.length || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      {completedActions.length === response.actions?.length && (
                        <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                          <Sparkles className="w-5 h-5" />
                          <span className="font-semibold">
                            Tuyệt vời! Bạn đã hoàn thành tất cả các bước!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Inspirational Quote - Beautiful presentation */}
                {response.quote && (
                  <div className="relative">
                    {/* Main Card */}
                    <div className="bg-linear-to-br from-purple-600 via-pink-500 to-rose-500 rounded-3xl p-8 sm:p-12 shadow-2xl">
                      <div className="flex flex-col items-center text-center space-y-6">
                        {/* Icon Circle */}
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                          <Sparkles className="w-10 h-10 text-white" />
                        </div>

                        {/* Quote Text */}
                        <div className="space-y-4">
                          <p className="text-xl sm:text-2xl font-semibold text-white leading-relaxed max-w-2xl px-4">
                            {response.quote}
                          </p>
                        </div>

                        {/* Decorative Line */}
                        <div className="w-24 h-1 bg-white/30 rounded-full"></div>

                        {/* Label */}
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full">
                          <Heart className="w-4 h-4 text-white" fill="white" />
                          <span className="text-white text-sm font-medium">
                            Lời động viên dành cho bạn
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Floating decorative elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-300 rounded-full opacity-20 blur-2xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-300 rounded-full opacity-20 blur-2xl"></div>
                  </div>
                )}

                {/* Action Buttons - Clear and inviting */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={resetAll}
                    className="bg-linear-to-r from-rose-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-rose-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Bắt đầu phiên mới
                  </button>

                  <button
                    onClick={() => {
                      alert(
                        "✅ Đã đặt nhắc nhở! Chúng mình sẽ nhắc bạn kiểm tra lại sau."
                      );
                    }}
                    className="bg-white border-2 border-purple-300 text-purple-700 py-4 px-6 rounded-2xl font-semibold hover:bg-purple-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                  >
                    <Clock className="w-5 h-5" />
                    Nhắc tôi sau
                  </button>
                </div>

                {/* Encouragement Message */}
                <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Sun className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">
                        Bạn đang làm rất tốt! 🌟
                      </h4>
                      <p className="text-amber-800 text-sm leading-relaxed">
                        Việc tìm kiếm sự hỗ trợ là một bước quan trọng. Hãy nhớ
                        rằng mỗi ngày mới là một cơ hội mới để cảm thấy tốt hơn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Footer */}
        <footer className="mt-12 space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-md">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                <strong className="text-gray-800">Lưu ý quan trọng:</strong>{" "}
                Công cụ này hỗ trợ tinh thần, không thay thế chẩn đoán y tế
                chuyên nghiệp.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <a
                  href="tel:115"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                >
                  <Phone className="w-4 h-4" />
                  115 - Cấp cứu
                </a>
                <a
                  href="tel:113"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Shield className="w-4 h-4" />
                  113 - Cảnh sát
                </a>
                <a
                  href="tel:18006003"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <Heart className="w-4 h-4" />
                  The Leaf: 18006003
                </a>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Được tạo ra với ❤️ để hỗ trợ sức khỏe tinh thần cộng đồng</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}
