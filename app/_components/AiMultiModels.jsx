"use client";

import React, { useContext, useState } from "react";
import AiModelList from "./../../shared/AiModelList";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader, LockIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

function AiMultiModels() {
  const { user } = useUser();

  const [aiModelList, setAiModelList] = useState(AiModelList);

  const {
    aiSelectedModels,
    setAiSelectedModels,
    messages,
  } = useContext(AiSelectedModelContext);

  // ==============================
  // TOGGLE ENABLE / DISABLE
  // ==============================
  const onToggleChange = (modelName, value) => {
    // Update UI model list
    setAiModelList((prev) =>
      prev.map((m) =>
        m.model === modelName ? { ...m, enable: value } : m
      )
    );

    // Update object state safely
    setAiSelectedModels((prev) => ({
      ...prev,
      [modelName]: {
        ...(prev?.[modelName] ?? {}),
        enable: value,
      },
    }));
  };

  // ==============================
  // SELECT SUB MODEL
  // ==============================
  const onSelectValue = async (parentModel, value) => {
    // Update state safely
    setAiSelectedModels((prev) => ({
      ...prev,
      [parentModel]: {
        ...(prev?.[parentModel] ?? {}),
        modelId: value,
      },
    }));

    // Update database via API
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      await axios.post('/api/user/update-preferences', {
        email: user.primaryEmailAddress.emailAddress,
        selectedModelPref: {
          ...aiSelectedModels,
          [parentModel]: {
            ...(aiSelectedModels?.[parentModel] ?? {}),
            modelId: value,
          },
        },
      });
    } catch (error) {
      console.error("Preference Update Error:", error);
    }
  };

  return (
    <div className="flex flex-1 h-[75vh] border-b">
      {aiModelList.map((model) => (
        <div
          key={model.model}
          className="flex flex-col border-r h-full flex-shrink-0"
        >
          <div
            className={`${
              model.enable ? "w-[400px]" : "w-[100px] flex-none"
            }`}
          >
            <div className="flex w-full h-[70px] items-center justify-between border-b p-4">
              {/* Model Header */}
              <div className="flex items-center gap-4">
                <Image
                  src={model.icon}
                  alt={model.model}
                  width={24}
                  height={24}
                />

                {model.enable && (
                  <Select
                    value={
                      aiSelectedModels?.[model.model]?.modelId ||
                      ""
                    }
                    onValueChange={(value) =>
                      onSelectValue(model.model, value)
                    }
                    disabled={model.premium}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup className="px-3">
                        <SelectLabel className="text-sm text-gray-400">
                          Free
                        </SelectLabel>
                        {model.subModel.map(
                          (subModel, i) =>
                            !subModel.premium && (
                              <SelectItem
                                key={i}
                                value={subModel.id}
                              >
                                {subModel.name}
                              </SelectItem>
                            )
                        )}
                      </SelectGroup>

                      <SelectGroup className="px-3">
                        <SelectLabel className="text-sm text-gray-400">
                          Premium
                        </SelectLabel>
                        {model.subModel.map(
                          (subModel, i) =>
                            subModel.premium && (
                              <SelectItem
                                key={i}
                                value={subModel.id}
                                disabled
                              >
                                {subModel.name}{" "}
                                <LockIcon className="h-4 w-4 inline" />
                              </SelectItem>
                            )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Enable Toggle */}
              {model.enable ? (
                <Switch
                  checked={model.enable}
                  onCheckedChange={(v) =>
                    onToggleChange(model.model, v)
                  }
                />
              ) : (
                <MessageSquare
                  className="cursor-pointer"
                  onClick={() =>
                    onToggleChange(model.model, true)
                  }
                />
              )}
            </div>
          </div>

          {/* Premium Lock UI */}
          {model.premium && model.enable && (
            <div className="flex items-center justify-center h-full">
              <Button>
                Upgrade to Unlock
              </Button>
            </div>
          )}

          {/* Messages Section */}
          {model.enable && (
            <div className="flex-1 p-4 space-y-2 overflow-auto">
              {messages?.[model.model]?.map((m, i) => (
                <div
                  key={`${model.model}-${i}`}
                  className={`p-2 rounded-md ${
                    m.role === "user"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {m.role === "assistant" && (
                    <span className="text-sm text-gray-400">
                      {m.model ?? model.model}
                    </span>
                  )}

                  {m.loading ? (
                    <div className="flex gap-3 items-center">
                      <Loader className="animate-spin h-4 w-4" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <h2>{m.content}</h2>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AiMultiModels;
