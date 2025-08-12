import { useState } from "react";
import { BfDsCard } from "@bfmono/apps/bfDs/components/BfDsCard.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";

export function Settings() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Mock data for now - will be replaced with GraphQL query
  const mockApiKeys = [
    {
      id: "1",
      key: "bf+dev-org:example.com",
      description: "Default API key",
      lastUsedAt: "",
    },
  ];

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setMessage("API key copied to clipboard!");
      setTimeout(() => {
        setCopiedKey(null);
        setMessage(null);
      }, 3000);
    } catch (_error) {
      setMessage("Failed to copy API key. Please copy manually.");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const renderApiKeys = () => {
    if (mockApiKeys.length === 0) {
      return (
        <div className="text-gray-500">
          No API keys found for your organization.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {mockApiKeys.map((apiKey) => {
          return (
            <div
              key={apiKey.id}
              className="border border-gray-300 rounded p-4 space-y-2"
              data-api-key-id={apiKey.id}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">
                    {apiKey.description || "API Key"}
                  </div>
                  <div className="font-mono text-sm text-gray-600">
                    {apiKey.key}
                  </div>
                  {apiKey.lastUsedAt && (
                    <div className="text-xs text-gray-500">
                      Last used: {new Date(apiKey.lastUsedAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <BfDsButton
                  onClick={() => handleCopyKey(apiKey.key)}
                  variant="outline"
                >
                  {copiedKey === apiKey.key ? "Copied!" : "Copy"}
                </BfDsButton>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Message Display */}
      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}

      {/* API Keys Section */}
      <BfDsCard className="mb-6">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">API Keys</h2>
          <div className="mb-4 text-sm text-gray-600">
            Use these API keys to authenticate with the Bolt Foundry API.
          </div>
          {renderApiKeys()}
        </div>
      </BfDsCard>
    </div>
  );
}
