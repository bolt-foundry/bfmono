import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsCodeExampleBasic() {
  const shortCode = `<BfDsButton variant="primary">Click me</BfDsButton>`;

  const longCode =
    `import { BfDsButton, BfDsInput, BfDsCard } from "@bfmono/bfDs";
import { useState } from "react";

function UserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await saveUser({ name, email });
      console.log("User saved successfully!");
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BfDsCard>
      <div className="form-container">
        <BfDsInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <BfDsInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <BfDsButton
          variant="primary"
          onClick={handleSubmit}
          spinner={loading}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save user"}
        </BfDsButton>
      </div>
    </BfDsCard>
  );
}`;

  const apiResponse = {
    user: {
      id: 123,
      name: "John Doe",
      email: "john@example.com",
      preferences: {
        theme: "dark",
        notifications: true,
        language: "en",
      },
    },
    permissions: ["read", "write", "admin"],
    lastLogin: "2024-01-15T10:30:00Z",
  };

  const configYaml = `version: "1.0"
name: "Bolt Foundry AI Config"
api:
  endpoint: "https://api.boltfoundry.com/v1"
  timeout: 30000
  retries: 3
  
models:
  - name: "claude-3-sonnet"
    max_tokens: 4000
    temperature: 0.7
  - name: "gpt-4-turbo"
    max_tokens: 8000
    temperature: 0.5
    
evaluation:
  metrics:
    - accuracy
    - response_time
    - user_satisfaction
  thresholds:
    accuracy: 0.85
    response_time: 2.0`;

  return (
    <div className="bfds-example">
      <h2>BfDsCodeExample Component</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsCodeExample } from "@bfmono/apps/bfDs/components/BfDsCodeExample.tsx";

// Basic usage
<BfDsCodeExample
  language="tsx"
  code={codeString}
/>

// All available props
<BfDsCodeExample
  code="console.log('Hello');"         // string - code content to display
  language="typescript"                // string - programming language
  collapsedLines={5}                  // number - lines to show when collapsed
  className=""                         // string - additional CSS classes
  showLineNumbers={false}             // boolean - show line numbers
  expandText="Show more"              // string - custom expand button text
  collapseText="Show less"            // string - custom collapse button text
/>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Basic Examples</h3>
        <div className="bfds-example__group">
          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Short Code (No Expansion)</h4>
            <BfDsCodeExample
              language="tsx"
              code={shortCode}
            />
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Collapsible Long Code</h4>
            <BfDsCodeExample
              language="tsx"
              code={longCode}
              collapsedLines={5}
            />
          </div>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>With Line Numbers</h3>
        <div className="bfds-example__group">
          <BfDsCodeExample
            language="typescript"
            code={longCode}
            collapsedLines={8}
            showLineNumbers
            expandText="View complete example"
            collapseText="Hide details"
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Different Languages</h3>
        <div className="bfds-example__group">
          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>JSON Response</h4>
            <BfDsCodeExample
              language="json"
              code={JSON.stringify(apiResponse, null, 2)}
              collapsedLines={6}
              showLineNumbers
            />
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>YAML Configuration</h4>
            <BfDsCodeExample
              language="yaml"
              code={configYaml}
              collapsedLines={5}
              expandText="Show full config"
              collapseText="Collapse config"
            />
          </div>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Custom Collapse Settings</h3>
        <div className="bfds-example__group">
          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Show Only 3 Lines</h4>
            <BfDsCodeExample
              language="tsx"
              code={longCode}
              collapsedLines={3}
              expandText="Show full component"
              collapseText="Minimize"
            />
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Custom Button Text</h4>
            <BfDsCodeExample
              language="javascript"
              code={`// Authentication helper function
async function authenticateUser(credentials) {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    throw new Error('Authentication failed');
  }
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.user;
}`}
              collapsedLines={4}
              expandText="📖 Read full function"
              collapseText="📘 Hide implementation"
              showLineNumbers
            />
          </div>
        </div>
      </div>
    </div>
  );
}
