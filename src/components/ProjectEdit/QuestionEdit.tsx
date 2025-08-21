"use client";

import { useState } from "react";
import RichTextEditor from "@/components/common/RichTextEditor/component";
import BeyondButton from "../common/BeyondComponents/BeyondButton";
import BeyondLineEdit from "../common/BeyondComponents/BeyondLineEdit";

const prompts = [
  "What encouraged you to work on this project?",
  "What was the biggest challenge you faced?",
  "What did you learn from this experience?",
  "If you were to start this project over, what would you do differently?",
];

export default function QuestionInput({
  prompt,
  answer,
  onPromptChange,
  onAnswerChange,
  onDelete,
}: {
  prompt: string;
  answer: string;
  onPromptChange: (
    prompt: string
  ) => Promise<{ ok: boolean; message?: string }>;
  onAnswerChange: (
    answer: string
  ) => Promise<{ ok: boolean; message?: string }>;
  onDelete: () => Promise<{ ok: boolean; message?: string }>;
}) {
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [localAnswer, setLocalAnswer] = useState(answer);
  const [customPrompt, setCustomPrompt] = useState(
    !prompts.some((p) => p === prompt) && prompt !== ""
  );
  const [error, setError] = useState<string | undefined>("");

  const handlePromptSelect = async (selectedPrompt: string) => {
    if (selectedPrompt === "custom") {
      setCustomPrompt(true);
      setLocalPrompt("");
    } else {
      setLocalPrompt(selectedPrompt);
      setCustomPrompt(false);
      const resp = await onPromptChange(selectedPrompt);
      if (!resp.ok) {
        setError(resp.message || "Failed to save prompt");
      }
    }
  };

  return (
    <div className="w-full mx-auto bg-bg-base-100 py-2 rounded-md">
      {error && (
        <div className="text-red-500 flex items-center space-x-2">
          <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center mx-2">
            !
          </span>
          {error}
        </div>
      )}
      <div className="flex flex-col w-full">
        <div className="flex w-full justify-between mb-0.5">
          <select
            onChange={(e) => handlePromptSelect(e.target.value)}
            className="border border-gray-300 rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={
              customPrompt
                ? "custom"
                : localPrompt === ""
                ? "default"
                : localPrompt
            }
          >
            <option value="default" disabled>
              Select a prompt
            </option>
            {prompts.map((prompt) => (
              <option key={prompt} value={prompt}>
                {prompt}
              </option>
            ))}
            <option value="custom">Write your own prompt!</option>
          </select>
          <BeyondButton
            className="h-8 flex items-center"
            onClick={() => {
              if (confirm("Are you sure you want to delete this question?"))
                onDelete();
            }}
          >
            Delete Question
          </BeyondButton>
        </div>
        <BeyondLineEdit
          value={localPrompt}
          onChange={async (value) => {
            const resp = await onPromptChange(value);
            setError(resp.message);
          }}
          disabled={!customPrompt}
          className="disabled:bg-gray-100 rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary mb-2 w-full"
        />
      </div>
      <RichTextEditor
        content={localAnswer}
        onChange={(value) => {
          setLocalAnswer(value);
        }}
        onBlur={async () => {
          const resp = await onAnswerChange(localAnswer);
          if (!resp.ok) {
            setError(resp.message || "Failed to save answer");
          }
        }}
      />
    </div>
  );
}
