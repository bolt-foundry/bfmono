import { useEffect, useRef, useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsCard } from "@bfmono/apps/bfDs/components/BfDsCard.tsx";
import { BfDsSelect } from "@bfmono/apps/bfDs/components/BfDsSelect.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { ChatMessage } from "./ChatMessage.tsx";
import { ChatInput } from "./ChatInput.tsx";
import { usePromptGradeContext } from "@bfmono/apps/boltfoundry-com/contexts/PromptGradeContext.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

interface MessageContentBlock {
  type: "text" | "choices" | "code" | "status";
  content: string;
  choices?: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  language?: string;
  status?: {
    type: "building" | "success" | "error";
    message: string;
  };
}

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string | Array<MessageContentBlock>;
  timestamp: string;
  metadata?: {
    model?: string;
    temperature?: number;
    evaluationScores?: Record<string, number>;
    flagged?: boolean;
    notes?: string;
  };
}

interface ChatSession {
  id: string;
  name: string;
  messages: Array<Message>;
  createdAt: string;
  lastUpdated: string;
  model: string;
  deck?: string;
}

// Mock data for demonstration
const mockSessions: Array<ChatSession> = [
  {
    id: "session_1",
    name: "Customer Support Test",
    model: "gpt-4",
    deck: "Customer Support Quality",
    createdAt: "2025-07-24T10:00:00Z",
    lastUpdated: "2025-07-24T10:30:00Z",
    messages: [
      {
        id: "msg_1",
        type: "user",
        content: "I'm having trouble with my account login. Can you help?",
        timestamp: "2025-07-24T10:00:00Z",
      },
      {
        id: "msg_2",
        type: "assistant",
        content:
          "I'd be happy to help you with your account login issue. Let me guide you through some troubleshooting steps. First, can you tell me what happens when you try to log in? Do you get an error message?",
        timestamp: "2025-07-24T10:00:15Z",
        metadata: {
          model: "gpt-4",
          temperature: 0.7,
          evaluationScores: { helpfulness: 95, accuracy: 88, tone: 92 },
        },
      },
      {
        id: "msg_3",
        type: "user",
        content:
          "Yes, it says 'Invalid credentials' but I'm sure my password is correct.",
        timestamp: "2025-07-24T10:01:00Z",
      },
      {
        id: "msg_4",
        type: "assistant",
        content:
          "That's frustrating! The 'Invalid credentials' error can happen for a few reasons even when your password is correct. Let's try these steps: 1) Clear your browser cache and cookies, 2) Try typing your password in a text editor first to make sure there are no hidden characters, 3) Check if Caps Lock is on. If none of these work, we can reset your password. Would you like to try these steps first?",
        timestamp: "2025-07-24T10:01:30Z",
        metadata: {
          model: "gpt-4",
          temperature: 0.7,
          evaluationScores: { helpfulness: 92, accuracy: 95, tone: 88 },
        },
      },
    ],
  },
];

const mockModels = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3", label: "Claude 3" },
  { value: "custom-model", label: "Custom Model" },
];

const mockDecks = [
  { value: "", label: "No evaluation deck" },
  { value: "customer-support", label: "Customer Support Quality" },
  { value: "code-generation", label: "Code Generation Accuracy" },
  { value: "content-moderation", label: "Content Moderation" },
];

interface ChatInterfaceProps {
  sessionId?: string;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const { openRightSidebar, chatMode, chatBackTarget, exitChatMode } =
    usePromptGradeContext();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    sessionId ? mockSessions.find((s) => s.id === sessionId) || null : null,
  );
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [selectedDeck, setSelectedDeck] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Deck creation state
  const [deckCreationStep, setDeckCreationStep] = useState(1);
  const [deckCreationData, setDeckCreationData] = useState({
    useCase: "",
    systemPrompt: "",
    graders: [] as Array<{ name: string; description: string; status: string }>,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  // Initialize deck creation conversation
  useEffect(() => {
    if (chatMode === "createDeck" && !currentSession) {
      const deckCreationSession: ChatSession = {
        id: `deck_creation_${Date.now()}`,
        name: "Create New Deck",
        model: "assistant",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        messages: [
          {
            id: "deck_welcome",
            type: "assistant",
            content: [
              {
                type: "text",
                content:
                  "<p style='font-weight: bold; margin-bottom: 0.5rem;'>I'm your AI evaluation assistant.</p><p>I'll help you build a robust evaluation system for your LLM. Let's start with understanding what you're trying to evaluate.</p>",
              },
              {
                type: "choices",
                content: "What kind of AI assistant are you building?",
                choices: [
                  { id: "coding", label: "Coding assistant", icon: "📝" },
                  {
                    id: "customer",
                    label: "Customer service chatbot",
                    icon: "🔬",
                  },
                  {
                    id: "creative",
                    label: "Creative writing helper",
                    icon: "🎨",
                  },
                  { id: "other", label: "Something else...", icon: "💡" },
                ],
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };
      setCurrentSession(deckCreationSession);
    }
  }, [chatMode, currentSession]);

  const startNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      name: `Chat Session ${new Date().toLocaleTimeString()}`,
      model: selectedModel,
      deck: selectedDeck,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messages: [],
    };
    setCurrentSession(newSession);
  };

  const handleSendMessage = (content: string) => {
    if (!currentSession) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      type: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    // Add user message
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      lastUpdated: new Date().toISOString(),
    };
    setCurrentSession(updatedSession);
    setIsLoading(true);

    // Handle deck creation flow
    if (chatMode === "createDeck") {
      handleDeckCreationResponse(content);
      return;
    }

    // Simulate AI response for regular chat
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        type: "assistant",
        content: generateMockResponse(content),
        timestamp: new Date().toISOString(),
        metadata: {
          model: selectedModel,
          temperature: 0.7,
          evaluationScores: selectedDeck
            ? {
              helpfulness: Math.floor(Math.random() * 20 + 80),
              accuracy: Math.floor(Math.random() * 20 + 80),
              relevance: Math.floor(Math.random() * 20 + 80),
            }
            : undefined,
        },
      };

      setCurrentSession((prev) =>
        prev
          ? {
            ...prev,
            messages: [...prev.messages, assistantMessage],
            lastUpdated: new Date().toISOString(),
          }
          : null
      );
      setIsLoading(false);
    }, 1500);
  };

  const generateMockResponse = (_userInput: string): string => {
    const responses = [
      "I understand your question. Let me help you with that. Based on what you've described, here are some suggestions that might be helpful.",
      "That's a great question! Here's what I would recommend in this situation. Let me break this down into a few key points.",
      "I see what you're looking for. This is actually a common scenario, and there are several approaches we can take to address it effectively.",
      "Thank you for providing that information. Based on your input, I can offer some guidance that should help resolve this issue.",
      "That's an interesting point you've raised. Let me provide some context and suggestions that might be useful for your situation.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleChoiceClick = (choiceId: string) => {
    if (chatMode === "createDeck") {
      // Simulate user selecting a choice
      handleSendMessage(choiceId);
    }
  };

  const handleDeckCreationResponse = (userInput: string) => {
    setTimeout(() => {
      let assistantContent: Array<MessageContentBlock> = [];

      if (deckCreationStep === 1) {
        // Handle use case selection step
        if (userInput.toLowerCase().includes("coding")) {
          setDeckCreationData((prev) => ({ ...prev, useCase: "coding" }));
          assistantContent = [
            {
              type: "text",
              content:
                "<p>Perfect! A coding assistant needs robust evaluation. Now I need to understand your assistant's behavior to create tailored graders.</p><p style='margin-top: 1rem;'>Could you share your AI system's prompt? This is the prompt that tells your coding assistant how to behave - something like 'You are a helpful coding assistant...'</p><p style='margin-top: 0.5rem; color: #999; font-size: 0.875rem;'>This helps me create graders that match your assistant's specific role and style.</p>",
            },
          ];
        } else if (userInput.toLowerCase().includes("customer")) {
          setDeckCreationData((prev) => ({ ...prev, useCase: "customer" }));
          assistantContent = [
            {
              type: "text",
              content:
                "<p>Excellent choice! Customer service chatbots need careful evaluation for tone, accuracy, and helpfulness.</p><p style='margin-top: 1rem;'>Please share your AI system's prompt - the instructions that guide your customer service bot's behavior.</p><p style='margin-top: 0.5rem; color: #999; font-size: 0.875rem;'>This will help me create graders that evaluate the specific qualities important for customer service.</p>",
            },
          ];
        } else {
          assistantContent = [
            {
              type: "text",
              content:
                "<p>Great! I'll help you create evaluation graders for your AI assistant.</p><p style='margin-top: 1rem;'>Please share your AI system's prompt - the instructions that define how your assistant should behave and respond.</p><p style='margin-top: 0.5rem; color: #999; font-size: 0.875rem;'>This will help me understand what qualities to evaluate in your assistant's responses.</p>",
            },
          ];
        }
        setDeckCreationStep(2);
      } else if (deckCreationStep === 2) {
        // Handle system prompt step
        setDeckCreationData((prev) => ({ ...prev, systemPrompt: userInput }));

        // Create graders based on use case
        const graders = deckCreationData.useCase === "coding"
          ? [
            {
              name: "Code Accuracy",
              description: "Validates syntax and logic",
              status: "building",
            },
            {
              name: "Language Simplicity",
              description: "Checks for clear, simple explanations",
              status: "building",
            },
            {
              name: "Helpfulness",
              description: "Ensures responses solve the problem",
              status: "building",
            },
            {
              name: "Explanation Quality",
              description: "Evaluates clarity and completeness",
              status: "building",
            },
          ]
          : [
            {
              name: "Accuracy",
              description: "Validates factual correctness",
              status: "building",
            },
            {
              name: "Helpfulness",
              description: "Ensures responses are useful",
              status: "building",
            },
            {
              name: "Clarity",
              description: "Checks for clear communication",
              status: "building",
            },
          ];

        setDeckCreationData((prev) => ({ ...prev, graders }));

        assistantContent = [
          {
            type: "text",
            content:
              "<p>Excellent! I can see your assistant emphasizes clarity, accuracy, and helpfulness. Let me create evaluation graders tailored to these goals.</p>",
          },
          {
            type: "code",
            content: `System Prompt Saved:\n"${
              userInput.substring(0, 100)
            }..."`,
          },
          {
            type: "status",
            content: "",
            status: {
              type: "building",
              message: "Creating tailored graders",
            },
          },
        ];

        setDeckCreationStep(3);

        // Update graders to ready status after a delay
        setTimeout(() => {
          setDeckCreationData((prev) => ({
            ...prev,
            graders: prev.graders.map((g) => ({ ...g, status: "ready" })),
          }));
        }, 3000);
      }

      const assistantMessage: Message = {
        id: `deck_msg_${Date.now()}`,
        type: "assistant",
        content: assistantContent,
        timestamp: new Date().toISOString(),
      };

      setCurrentSession((prev) =>
        prev
          ? {
            ...prev,
            messages: [...prev.messages, assistantMessage],
            lastUpdated: new Date().toISOString(),
          }
          : null
      );
      setIsLoading(false);
    }, 1500);
  };

  const handleMessageAction = (messageId: string, action: string) => {
    logger.info(`Action ${action} on message ${messageId}`);
    if (action === "evaluate") {
      openRightSidebar(`Evaluate Message ${messageId}`);
    } else if (action === "flag") {
      // Toggle flag status
      setCurrentSession((prev) =>
        prev
          ? {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.id === messageId
                ? {
                  ...msg,
                  metadata: {
                    ...msg.metadata,
                    flagged: !msg.metadata?.flagged,
                  },
                }
                : msg
            ),
          }
          : null
      );
    }
  };

  if (!currentSession) {
    return (
      <div className="chat-interface">
        <div className="view-header">
          <h2>Interactive Chat</h2>
          <p className="view-description">
            Start a conversation with your AI model and evaluate responses in
            real-time
          </p>
        </div>

        <div className="chat-setup">
          <BfDsCard>
            <div className="setup-content">
              <h3>Start New Chat Session</h3>
              <p>
                Configure your chat session settings and begin interacting with
                your AI model.
              </p>

              <div className="setup-controls">
                <div className="control-group">
                  <label>Model</label>
                  <BfDsSelect
                    value={selectedModel}
                    onChange={setSelectedModel}
                    options={mockModels}
                  />
                </div>

                <div className="control-group">
                  <label>Evaluation Deck (Optional)</label>
                  <BfDsSelect
                    value={selectedDeck}
                    onChange={setSelectedDeck}
                    options={mockDecks}
                  />
                </div>
              </div>

              <div className="setup-actions">
                <BfDsButton
                  variant="primary"
                  onClick={startNewSession}
                >
                  Start Chat
                </BfDsButton>
                <BfDsButton
                  variant="outline"
                  onClick={() => openRightSidebar("Chat History")}
                >
                  View History
                </BfDsButton>
              </div>
            </div>
          </BfDsCard>
        </div>

        <BfDsEmptyState
          icon="chat"
          title="Ready to start chatting"
          description="Configure your settings above and start a new conversation to begin evaluating your AI model's responses"
        />
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        {chatMode === "createDeck" && (
          <div className="chat-back-button">
            <BfDsButton
              variant="outline"
              size="small"
              icon="arrow-left"
              onClick={exitChatMode}
            >
              Back to {chatBackTarget}
            </BfDsButton>
          </div>
        )}
        <div className="session-info">
          <h2>{currentSession.name}</h2>
          <div className="session-meta">
            <span>Model: {currentSession.model}</span>
            {currentSession.deck && <span>Deck: {currentSession.deck}</span>}
            <span>{currentSession.messages.length} messages</span>
          </div>
        </div>
        <div className="chat-actions">
          {chatMode !== "createDeck" && (
            <>
              <BfDsButton
                variant="outline"
                size="small"
                onClick={() => openRightSidebar("Session Settings")}
              >
                Settings
              </BfDsButton>
              <BfDsButton
                variant="outline"
                size="small"
                onClick={() => setCurrentSession(null)}
              >
                New Chat
              </BfDsButton>
            </>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {currentSession.messages.length === 0
          ? (
            <BfDsEmptyState
              icon="chat"
              title="Start the conversation"
              description="Type your first message below to begin chatting with the AI model"
              size="small"
            />
          )
          : (
            <>
              {currentSession.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  showEvaluation={!!currentSession.deck}
                  onAction={(action) => handleMessageAction(message.id, action)}
                  onChoiceClick={handleChoiceClick}
                />
              ))}
              {isLoading && (
                <div className="typing-indicator">
                  <div className="typing-avatar">AI</div>
                  <div className="typing-content">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
      </div>

      <div className="chat-input-container">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
}
