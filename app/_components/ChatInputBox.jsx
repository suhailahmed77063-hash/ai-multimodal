"use client";

import { Button } from "@/components/ui/button";
import { Mic, Paperclip, Send } from "lucide-react";
import React, { useContext, useState } from "react";
import AiMultiModels from "./AiMultiModels";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const { user } = useUser();
  const { aiSelectedModels, setMessages } =
    useContext(AiSelectedModelContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const currentInput = userInput;
    setUserInput("");

    // Add user message
    setMessages((prev) => {
      const updated = { ...prev };

      Object.keys(aiSelectedModels).forEach(
        (key) => {
          if (aiSelectedModels[key].enable) {

          updated[key] = [
            ...(updated[key] ?? []),
            { role: "user", content: currentInput },
          ];
        }
    });
    
      return updated;
    });

    // Process each enabled model
    for (const [parentModel, modelInfo] of Object.entries(
      aiSelectedModels
    )) {
      if (!modelInfo.enable || !modelInfo.modelId) continue;

      // Loading state
      setMessages((prev) => ({
        ...prev,
        [parentModel]: [
          ...(prev[parentModel] ?? []),
          { role: "assistant", content: "Loading...", loading: true },
        ],
      }));

      try {
        const result = await axios.post("/api/ai-multi-model", {
          model: modelInfo.modelId,
          msg: [{ role: "user", content: currentInput }],
          parentModel,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          userId: userDetail?.id,
        });

        if (!result.data || result.data.error) {
          throw new Error(result.data?.error || "AI failed");
        }

        // Update user credits in context
        if (result.data.creditsDeducted) {
          setUserDetail((prev) => ({
            ...prev,
            credits: Math.max(0, (prev?.credits || 0) - result.data.creditsDeducted),
          }));
        }

        setMessages((prev) => {
          const updated = [...(prev[parentModel] ?? [])];
          const index = updated.findIndex((m) => m.loading);

          if (index !== -1) {
            updated[index] = {
              role: "assistant",
              content: result.data.aiResponse,
              model: result.data.model,
              loading: false,
            };
          }

          return { ...prev, [parentModel]: updated };
        });

      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          "Server error";

        setMessages((prev) => {
          const updated = [...(prev[parentModel] ?? [])];
          const index = updated.findIndex((m) => m.loading);

          if (index !== -1) {
            updated[index] = {
              role: "assistant",
              content: `⚠ ${errorMessage}`,
              loading: false,
            };
          }

          return { ...prev, [parentModel]: updated };
        });
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      <AiMultiModels />

      <div className="fixed bottom-0 left-0 w-full flex justify-center px-4 pb-4">
        <div className="w-full border rounded-xl shadow-md max-w-2xl p-4">
          <input
            type="text"
            placeholder="Ask me anything..."
            className="border-0 outline-none w-full"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <div className="mt-3 flex justify-between items-center">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>

            <div className="flex gap-5">
              <Button variant="ghost" size="icon">
                <Mic />
              </Button>
              <Button
                size="icon"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleSend}
                disabled={!userInput.trim()}
              >
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;
