import React, { useState } from "react";
import { BfDsCard } from "@bfmono/apps/bfDs/BfDsCard.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/BfDsButton.tsx";
import { BfDsInput } from "@bfmono/apps/bfDs/BfDsInput.tsx";
import { BfDsLabel } from "@bfmono/apps/bfDs/BfDsLabel.tsx";
import { BfDsForm } from "@bfmono/apps/bfDs/BfDsForm.tsx";
import { BfDsToggle } from "@bfmono/apps/bfDs/BfDsToggle.tsx";
import { BfDsSelect } from "@bfmono/apps/bfDs/BfDsSelect.tsx";
import { graphql } from "@bfmono/apps/boltfoundry-com/relay.ts";
import { useIsographRelay } from "@bfmono/apps/boltfoundry-com/useIsographRelay.tsx";

export function Settings() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const apiKeysQuery = useIsographRelay(
    graphql`
      query Settings__apiKeys {
        Query__organizationApiKeys @loadable {
          edges {
            node {
              id
              key
              description
              lastUsedAt
            }
          }
        }
      }
    `,
    {},
  );

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setMessage("API key copied to clipboard!");
      setTimeout(() => {
        setCopiedKey(null);
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage("Failed to copy API key. Please copy manually.");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const renderApiKeys = () => {
    if (apiKeysQuery.state.type === "loading") {
      return <div className="text-gray-500">Loading API keys...</div>;
    }

    if (apiKeysQuery.state.type === "error") {
      return (
        <div className="text-red-500">
          Error loading API keys: {apiKeysQuery.state.error.message}
        </div>
      );
    }

    if (apiKeysQuery.state.type === "loaded") {
      const edges = apiKeysQuery.state.value?.edges || [];

      if (edges.length === 0) {
        return (
          <div className="text-gray-500">
            No API keys found for your organization.
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {edges.map((edge) => {
            const apiKey = edge?.node;
            if (!apiKey) return null;

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
                        Last used:{" "}
                        {new Date(apiKey.lastUsedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <BfDsButton
                    onClick={() => handleCopyKey(apiKey.key)}
                    variant="outline"
                    size="sm"
                  >
                    {copiedKey === apiKey.key ? "Copied!" : "Copy"}
                  </BfDsButton>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
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

      {/* Placeholder sections for future settings */}
      <BfDsCard className="mb-6">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          <BfDsForm>
            <div className="space-y-4">
              <div>
                <BfDsLabel htmlFor="name">Name</BfDsLabel>
                <BfDsInput id="name" placeholder="Your name" />
              </div>
              <div>
                <BfDsLabel htmlFor="email">Email</BfDsLabel>
                <BfDsInput
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </BfDsForm>
        </div>
      </BfDsCard>

      <BfDsCard>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email notifications</span>
              <BfDsToggle />
            </div>
            <div className="flex items-center justify-between">
              <span>Dark mode</span>
              <BfDsToggle />
            </div>
            <div>
              <BfDsLabel htmlFor="language">Language</BfDsLabel>
              <BfDsSelect id="language">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </BfDsSelect>
            </div>
          </div>
        </div>
      </BfDsCard>
    </div>
  );
}
