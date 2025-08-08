/**
 * @fileoverview BfDs HUD Context - Development tools overlay system for the Bolt Foundry Design System
 *
 * This context provides a floating HUD (Heads-Up Display) system for development tools,
 * debugging interfaces, and administrative controls. The HUD includes action buttons,
 * console messaging, input fields, and visibility controls.
 *
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 * @see {@link BfDsHud} - HUD component that renders the development overlay
 * @see {@link BfDsProvider} - Main provider that includes HUD functionality
 */

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

/**
 * @typedef {Object} BfDsHudButton
 * @description Configuration for a HUD action button with optional toggle functionality
 * @property {string} id - Unique identifier for the button
 * @property {string} label - Display text for the button
 * @property {Function} onClick - Click handler for regular buttons
 * @property {string} [icon] - Optional icon name from BfDs icon library
 * @property {string} [variant="secondary"] - Visual style variant matching BfDsButton variants
 * @property {boolean} [toggleable=false] - Whether the button acts as a toggle switch
 * @property {boolean} [value] - Current toggle state (only for toggleable buttons)
 * @property {Function} [onToggle] - Toggle handler (only for toggleable buttons)
 */
export interface BfDsHudButton {
  /** Unique identifier for the button */
  id: string;
  /** Display text for the button */
  label: string;
  /** Click handler for regular buttons */
  onClick: () => void;
  /** Optional icon name from BfDs icon library */
  icon?: string;
  /** Visual style variant matching BfDsButton variants */
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "outline"
    | "outline-secondary"
    | "ghost-primary";
  /** Whether the button acts as a toggle switch */
  toggleable?: boolean;
  /** Current toggle state (only for toggleable buttons) */
  value?: boolean;
  /** Toggle handler (only for toggleable buttons) */
  onToggle?: (value: boolean) => void;
}

/**
 * @typedef {Object} BfDsHudMessage
 * @description Structure for console messages displayed in the HUD
 * @property {string} id - Unique identifier for the message
 * @property {string} content - Message text content
 * @property {number} timestamp - Unix timestamp when message was created
 * @property {"info" | "success" | "warning" | "error"} [type="info"] - Message type affecting visual styling
 */
export interface BfDsHudMessage {
  /** Unique identifier for the message */
  id: string;
  /** Message text content */
  content: string;
  /** Unix timestamp when message was created */
  timestamp: number;
  /** Message type affecting visual styling */
  type?: "info" | "success" | "warning" | "error";
}

/**
 * @typedef {Object} BfDsHudContextType
 * @description Complete interface for HUD functionality including button management, messaging, and input handling
 *
 * @property {Array<BfDsHudButton>} buttons - Array of currently registered action buttons
 * @property {Function} addButton - Add or update a HUD action button
 * @property {Function} removeButton - Remove a HUD action button by ID
 *
 * @property {Array<BfDsHudMessage>} messages - Array of console messages
 * @property {number} currentMessageIndex - Index of currently displayed message
 * @property {Function} sendMessage - Add a new message to the console
 * @property {Function} clearMessages - Remove all console messages
 * @property {Function} navigateMessages - Navigate between console messages
 *
 * @property {boolean} isVisible - Current HUD visibility state
 * @property {Function} showHud - Make the HUD visible
 * @property {Function} hideHud - Hide the HUD
 * @property {Function} toggleHud - Toggle HUD visibility
 *
 * @property {string} input1 - Value of first input field
 * @property {string} input2 - Value of second input field
 * @property {Function} setInput1 - Update first input field value
 * @property {Function} setInput2 - Update second input field value
 * @property {Function} getInputs - Get current values of both input fields
 */
interface BfDsHudContextType {
  // Button management
  /** Array of currently registered action buttons */
  buttons: Array<BfDsHudButton>;
  /** Add or update a HUD action button */
  addButton: (button: BfDsHudButton) => void;
  /** Remove a HUD action button by ID */
  removeButton: (id: string) => void;

  // Console messages
  /** Array of console messages */
  messages: Array<BfDsHudMessage>;
  /** Index of currently displayed message */
  currentMessageIndex: number;
  /** Add a new message to the console */
  sendMessage: (content: string, type?: BfDsHudMessage["type"]) => void;
  /** Remove all console messages */
  clearMessages: () => void;
  /** Navigate between console messages */
  navigateMessages: (direction: "prev" | "next") => void;

  // HUD visibility
  /** Current HUD visibility state */
  isVisible: boolean;
  /** Make the HUD visible */
  showHud: () => void;
  /** Hide the HUD */
  hideHud: () => void;
  /** Toggle HUD visibility */
  toggleHud: () => void;

  // Input management
  /** Value of first input field */
  input1: string;
  /** Value of second input field */
  input2: string;
  /** Update first input field value */
  setInput1: (value: string) => void;
  /** Update second input field value */
  setInput2: (value: string) => void;
  /** Get current values of both input fields */
  getInputs: () => { input1: string; input2: string };
}

/**
 * @private
 * @description Internal React context for HUD development tools system
 */
const BfDsHudContext = createContext<BfDsHudContextType | undefined>(undefined);

/**
 * @typedef {Object} BfDsHudProviderProps
 * @description Props for the BfDsHudProvider component
 * @property {ReactNode} children - Child components that will have access to HUD functionality
 * @property {number} [maxMessages=100] - Maximum number of console messages to retain
 */
interface BfDsHudProviderProps {
  /** Child components that will have access to HUD functionality */
  children: ReactNode;
  /** Maximum number of console messages to retain */
  maxMessages?: number;
}

/**
 * Provider component that enables HUD development tools throughout the application.
 *
 * This component sets up the HUD system for development and debugging purposes.
 * The HUD provides a floating interface with action buttons, console messaging,
 * input fields, and visibility controls. Should be placed high in your component
 * tree during development.
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components that will have access to HUD functionality
 * @param {number} [props.maxMessages=100] - Maximum number of console messages to retain in memory
 *
 * @returns {React.ReactElement} Provider component that enables HUD functionality
 *
 * @example
 * // Basic development setup
 * function App() {
 *   return (
 *     <BfDsHudProvider>
 *       <MyDevelopmentApp />
 *     </BfDsHudProvider>
 *   );
 * }
 *
 * @example
 * // With custom message limit
 * function App() {
 *   return (
 *     <BfDsHudProvider maxMessages={50}>
 *       <MyLimitedApp />
 *     </BfDsHudProvider>
 *   );
 * }
 *
 * @example
 * // Conditional development HUD
 * function App() {
 *   return (
 *     <div>
 *       {process.env.NODE_ENV === 'development' && (
 *         <BfDsHudProvider>
 *           <MyApp />
 *         </BfDsHudProvider>
 *       )}
 *       {process.env.NODE_ENV !== 'development' && <MyApp />}
 *     </div>
 *   );
 * }
 *
 * @see {@link useHud} - Hook to access HUD functionality
 * @see {@link BfDsHud} - HUD component that renders the development overlay
 */
export function BfDsHudProvider(
  { children, maxMessages = 100 }: BfDsHudProviderProps,
) {
  const [buttons, setButtons] = useState<Array<BfDsHudButton>>([]);
  const [messages, setMessages] = useState<Array<BfDsHudMessage>>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  const addButton = useCallback((button: BfDsHudButton) => {
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
    (content: string, type: BfDsHudMessage["type"] = "info") => {
      const newMessage: BfDsHudMessage = {
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
    <BfDsHudContext.Provider
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
    </BfDsHudContext.Provider>
  );
}

/**
 * Custom hook to access the HUD development tools from any component.
 *
 * This hook provides access to all HUD functionality including button management,
 * console messaging, input handling, and visibility controls. Designed for use
 * during development and debugging.
 *
 * @returns {BfDsHudContextType} Complete HUD management interface
 *
 * @throws {Error} When used outside of a BfDsHudProvider
 *
 * @example
 * // Adding action buttons to HUD
 * function MyDevComponent() {
 *   const { addButton, removeButton } = useHud();
 *
 *   useEffect(() => {
 *     addButton({
 *       id: 'clear-cache',
 *       label: 'Clear Cache',
 *       icon: 'trash',
 *       onClick: () => localStorage.clear()
 *     });
 *
 *     return () => removeButton('clear-cache');
 *   }, [addButton, removeButton]);
 * }
 *
 * @example
 * // Toggle buttons for feature flags
 * function FeatureToggle() {
 *   const { addButton } = useHud();
 *   const [debugMode, setDebugMode] = useState(false);
 *
 *   useEffect(() => {
 *     addButton({
 *       id: 'debug-toggle',
 *       label: 'Debug Mode',
 *       toggleable: true,
 *       value: debugMode,
 *       onToggle: setDebugMode
 *     });
 *   }, [debugMode]);
 * }
 *
 * @example
 * // Console messaging
 * function MyComponent() {
 *   const { sendMessage, clearMessages } = useHud();
 *
 *   const handleApiCall = async () => {
 *     sendMessage('Starting API call...', 'info');
 *     try {
 *       const result = await apiCall();
 *       sendMessage('API call successful', 'success');
 *     } catch (error) {
 *       sendMessage(`API error: ${error.message}`, 'error');
 *     }
 *   };
 * }
 *
 * @example
 * // Using input fields for dynamic actions
 * function AdminActions() {
 *   const { getInputs, input1, setInput1, sendMessage } = useHud();
 *
 *   const handleAdminAction = () => {
 *     const { input1: userId } = getInputs();
 *     if (userId) {
 *       performAdminAction(userId);
 *       sendMessage(`Action performed for user: ${userId}`, 'success');
 *       setInput1(''); // Clear input
 *     }
 *   };
 * }
 *
 * @example
 * // HUD visibility control
 * function MyComponent() {
 *   const { isVisible, toggleHud, showHud, hideHud } = useHud();
 *
 *   // Show HUD on error, hide on success
 *   const handleOperation = () => {
 *     try {
 *       performOperation();
 *       hideHud();
 *     } catch (error) {
 *       showHud();
 *     }
 *   };
 * }
 */
export function useHud() {
  const context = useContext(BfDsHudContext);
  if (context === undefined) {
    throw new Error("useHud must be used within a BfDsHudProvider");
  }
  return context;
}
