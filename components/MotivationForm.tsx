"use client";

import React, { useState } from "react";
import {
  Heart,
  Send,
  MessageCircle,
  Loader2,
  Shield,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Brain,
  ChevronDown,
} from "lucide-react";

interface TriageAnswers {
  feeling: string;
  suicidal: "no" | "unsure" | "yes";
  supportNearby: "alone" | "withSomeone" | "preferNotSay";
  mood: number;
}

interface AIResponse {
  type: "normal" | "crisis";
  emotion?: "sad" | "stressed" | "anxious" | "lost" | "hopeful";
  empathy?: string;
  advice?: string;
  actions?: string[];
  quote?: string;
  message?: string;
  detectedIssue?: string;
}

type Stage = "form" | "loading" | "response";

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
    setAnswers({ feeling: "", suicidal: "no", supportNearby: "alone", mood: 5 });
    setResponse(null);
    setCompletedActions([]);
    setExpandedAction(null);
  };

  const toggleAction = (index: number) => {
    setCompletedActions(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const getMoodLabel = (mood: number) => {
    if (mood <= 2) return "Rất khó khăn";
    if (mood <= 4) return "Khó khăn";
    if (mood <= 6) return "Ổn";
    if (mood <= 8) return "Tốt";
    return "Rất tốt";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Simple Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              MindX
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI hỗ trợ sức khỏe tinh thần • Miễn phí • Bảo mật
          </p>
        </header>

        {/* Form Stage */}
        {stage === "form" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
            {/* Main Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900">
                Bạn đang cảm thấy thế nào?
              </label>
              <textarea
                value={answers.feeling}
                onChange={(e) => setAnswers({ ...answers, feeling: e.target.value })}
                placeholder="Hãy chia sẻ những gì đang trăn trở trong lòng bạn..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg outline-none resize-none text-gray-900 placeholder-gray-400"
                maxLength={1000}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{answers.feeling.length}/1000</span>
                {answers.feeling.length > 0 && (
                  <span className="text-green-600">✓ Cảm ơn bạn đã chia sẻ</span>
                )}
              </div>
            </div>

            {/* Assessment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              {/* Suicidal */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Có suy nghĩ tự hại?
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "no", label: "Không" },
                    { value: "unsure", label: "Không chắc" },
                    { value: "yes", label: "Có" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAnswers({ ...answers, suicidal: opt.value as any })}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        answers.suicidal === opt.value
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Support */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tình trạng hiện tại
                </label>
                <select
                  value={answers.supportNearby}
                  onChange={(e) => setAnswers({ ...answers, supportNearby: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                >
                  <option value="alone">Đang một mình</option>
                  <option value="withSomeone">Có người bên cạnh</option>
                  <option value="preferNotSay">Không muốn nói</option>
                </select>
              </div>
            </div>

            {/* Mood Slider */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  Tâm trạng: <span className="font-bold text-gray-900">{getMoodLabel(answers.mood)}</span>
                </label>
                <span className="text-2xl font-bold text-gray-900">{answers.mood}/10</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={answers.mood}
                onChange={(e) => setAnswers({ ...answers, mood: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !answers.feeling.trim()}
              className="w-full bg-gray-900 text-white py-3.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Nhận hỗ trợ từ AI
            </button>

            {/* Privacy Note */}
            <div className="flex items-start gap-2 text-xs text-gray-500 pt-2">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Thông tin của bạn được mã hóa end-to-end và không lưu trữ lâu dài.</p>
            </div>
          </div>
        )}

        {/* Loading Stage */}
        {stage === "loading" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Đang phân tích...
            </h3>
            <p className="text-gray-600">
              AI đang chuẩn bị phản hồi chi tiết cho bạn
            </p>
          </div>
        )}

        {/* Response Stage */}
        {stage === "response" && response && (
          <div className="space-y-6">
            {response.type === "crisis" ? (
              /* Crisis Response */
              <div className="bg-white rounded-2xl shadow-sm border-2 border-red-500 overflow-hidden">
                <div className="bg-red-50 border-b border-red-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <h2 className="text-xl font-bold text-red-900">Tình huống khẩn cấp</h2>
                  </div>
                  <p className="text-red-800">{response.message}</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a
                      href="tel:115"
                      className="flex flex-col items-center gap-2 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Phone className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-bold text-lg">115</div>
                        <div className="text-xs opacity-90">Cấp cứu</div>
                      </div>
                    </a>
                    
                    <a
                      href="tel:113"
                      className="flex flex-col items-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Shield className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-bold text-lg">113</div>
                        <div className="text-xs opacity-90">Cảnh sát</div>
                      </div>
                    </a>
                    
                    <a
                      href="tel:18006003"
                      className="flex flex-col items-center gap-2 p-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Heart className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-bold text-lg">18006003</div>
                        <div className="text-xs opacity-90">The Leaf</div>
                      </div>
                    </a>
                  </div>

                  <button
                    onClick={resetAll}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Response */
              <div className="space-y-4">
                {/* Issue Badge */}
                {response.detectedIssue && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {response.detectedIssue}
                    </span>
                  </div>
                )}

                {/* Empathy */}
                {response.empathy && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-3">
                      <Heart className="w-6 h-6 text-rose-500 shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Mình hiểu bạn</h3>
                        <p className="text-gray-700 leading-relaxed">{response.empathy}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advice */}
                {response.advice && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-gray-600" />
                      Phân tích & Lời khuyên
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{response.advice}</p>
                  </div>
                )}

                {/* Actions */}
                {response.actions && response.actions.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Hành động cụ thể ({completedActions.length}/{response.actions.length})
                    </h3>
                    
                    <div className="space-y-3">
                      {response.actions.map((action, idx) => {
                        const isCompleted = completedActions.includes(idx);
                        const isExpanded = expandedAction === idx;
                        const preview = action.slice(0, 100);
                        const needsExpand = action.length > 100;
                        
                        return (
                          <div
                            key={idx}
                            className={`border-2 rounded-lg overflow-hidden transition-all ${
                              isCompleted ? "border-green-500 bg-green-50" : "border-gray-200"
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => toggleAction(idx)}
                                  className={`w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                                    isCompleted
                                      ? "bg-green-500 border-green-500"
                                      : "border-gray-300 hover:border-gray-400"
                                  }`}
                                >
                                  {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                                </button>
                                
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm leading-relaxed ${
                                    isCompleted ? "text-green-900" : "text-gray-700"
                                  }`}>
                                    {isExpanded ? action : preview}
                                    {needsExpand && !isExpanded && "..."}
                                  </div>
                                  
                                  {needsExpand && (
                                    <button
                                      onClick={() => setExpandedAction(isExpanded ? null : idx)}
                                      className="mt-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                                    >
                                      {isExpanded ? "Thu gọn" : "Xem đầy đủ"}
                                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress */}
                    {completedActions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(completedActions.length / (response.actions?.length || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {Math.round((completedActions.length / (response.actions?.length || 1)) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quote */}
                {response.quote && (
                  <div className="bg-gray-900 text-white rounded-xl p-6 italic text-center">
                    "{response.quote}"
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={resetAll}
                    className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Phiên mới
                  </button>
                  
                  <button
                    onClick={() => alert("✓ Đã đặt nhắc nhở")}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    Nhắc sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center space-y-3 text-sm text-gray-500">
          <p>
            Công cụ hỗ trợ, không thay thế chẩn đoán y tế.
          </p>
          <div className="flex justify-center gap-6">
            <a href="tel:115" className="hover:text-gray-700">115 - Cấp cứu</a>
            <a href="tel:113" className="hover:text-gray-700">113 - Cảnh sát</a>
            <a href="tel:18006003" className="hover:text-gray-700">The Leaf: 18006003</a>
          </div>
        </footer>
      </div>
    </div>
  );
}