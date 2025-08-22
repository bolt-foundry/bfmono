import { useEffect, useRef, useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsTextArea } from "@bfmono/apps/bfDs/components/BfDsTextArea.tsx";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 2000,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isMultiline, setIsMultiline] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage("");
      setIsMultiline(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift+Enter for new line
        setIsMultiline(true);
      } else {
        // Enter to send
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);

      // Auto-expand for multiline content
      if (value.includes("\n") || value.length > 100) {
        setIsMultiline(true);
      }
    }
  };

  // Auto-focus the input
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const canSend = message.trim().length > 0 && !disabled;
  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <div className="chat-input">
      <div className="input-container">
        <div className="textarea-wrapper">
          <BfDsTextArea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={isMultiline ? 3 : 1}
            resize="none"
            className="chat-textarea"
          />

          {characterCount > 0 && (
            <div
              className={`character-count ${isNearLimit ? "near-limit" : ""}`}
            >
              {characterCount}/{maxLength}
            </div>
          )}
        </div>

        <div className="input-actions">
          <BfDsButton
            variant="primary"
            iconOnly
            icon="send"
            onClick={handleSubmit}
            disabled={!canSend}
            title="Send message (Enter)"
            size="medium"
          />
        </div>
      </div>

      <div className="input-help">
        <span className="help-text">
          Press <kbd>Enter</kbd> to send, <kbd>Shift</kbd> + <kbd>Enter</kbd>
          {" "}
          for new line
        </span>
        {disabled && (
          <span className="disabled-text">
            Waiting for response...
          </span>
        )}
      </div>
    </div>
  );
}
