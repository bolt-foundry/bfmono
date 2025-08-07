import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface HudButton {
  id: string;
  label: string;
  onClick: () => void;
  icon?: string;
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "outline"
    | "outline-secondary"
    | "ghost-primary";
}

export interface HudMessage {
  id: string;
  content: string;
  timestamp: number;
  type?: "info" | "success" | "warning" | "error";
}

interface HudContextType {
  // Button management
  buttons: Array<HudButton>;
  addButton: (button: HudButton) => void;
  removeButton: (id: string) => void;

  // Console messages
  messages: Array<HudMessage>;
  currentMessageIndex: number;
  sendMessage: (content: string, type?: HudMessage["type"]) => void;
  clearMessages: () => void;
  navigateMessages: (direction: "prev" | "next") => void;

  // HUD visibility
  isVisible: boolean;
  showHud: () => void;
  hideHud: () => void;
  toggleHud: () => void;

  // Input management
  input1: string;
  input2: string;
  setInput1: (value: string) => void;
  setInput2: (value: string) => void;
  getInputs: () => { input1: string; input2: string };
}

const HudContext = createContext<HudContextType | undefined>(undefined);

interface HudProviderProps {
  children: ReactNode;
  maxMessages?: number;
}

export function HudProvider({ children, maxMessages = 100 }: HudProviderProps) {
  const [buttons, setButtons] = useState<Array<HudButton>>([]);
  const [messages, setMessages] = useState<Array<HudMessage>>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  const addButton = useCallback((button: HudButton) => {
    setButtons((prev) => {
      // Check if button with this ID already exists
      const exists = prev.some((b) => b.id === button.id);
      if (exists) {
        // Update existing button
        return prev.map((b) => b.id === button.id ? button : b);
      }
      // Add new button
      return [...prev, button];
    });
  }, []);

  const removeButton = useCallback((id: string) => {
    setButtons((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const sendMessage = useCallback(
    (content: string, type: HudMessage["type"] = "info") => {
      const newMessage: HudMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        content,
        timestamp: Date.now(),
        type,
      };

      setMessages((prev) => {
        const updated = [...prev, newMessage];
        // Keep only the last maxMessages
        if (updated.length > maxMessages) {
          return updated.slice(-maxMessages);
        }
        return updated;
      });

      // Auto-navigate to the newest message
      setCurrentMessageIndex(() => {
        const newLength = messages.length + 1;
        return Math.min(newLength - 1, maxMessages - 1);
      });
    },
    [messages.length, maxMessages],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentMessageIndex(0);
  }, []);

  const navigateMessages = useCallback((direction: "prev" | "next") => {
    setCurrentMessageIndex((prev) => {
      if (direction === "prev") {
        return Math.max(0, prev - 1);
      } else {
        return Math.min(messages.length - 1, prev + 1);
      }
    });
  }, [messages.length]);

  const showHud = useCallback(() => setIsVisible(true), []);
  const hideHud = useCallback(() => setIsVisible(false), []);
  const toggleHud = useCallback(() => setIsVisible((prev) => !prev), []);

  const getInputs = useCallback(() => ({ input1, input2 }), [input1, input2]);

  return (
    <HudContext.Provider
      value={{
        buttons,
        addButton,
        removeButton,
        messages,
        currentMessageIndex,
        sendMessage,
        clearMessages,
        navigateMessages,
        isVisible,
        showHud,
        hideHud,
        toggleHud,
        input1,
        input2,
        setInput1,
        setInput2,
        getInputs,
      }}
    >
      {children}
    </HudContext.Provider>
  );
}

export function useHud() {
  const context = useContext(HudContext);
  if (context === undefined) {
    throw new Error("useHud must be used within a HudProvider");
  }
  return context;
}

// Convenience hooks
export function useHudButtons() {
  const { addButton, removeButton } = useHud();
  return { addButton, removeButton };
}

export function useHudConsole() {
  const { sendMessage, clearMessages } = useHud();
  return { sendMessage, clearMessages };
}

export function useHudInputs() {
  const { input1, input2, setInput1, setInput2, getInputs } = useHud();
  return { input1, input2, setInput1, setInput2, getInputs };
}
