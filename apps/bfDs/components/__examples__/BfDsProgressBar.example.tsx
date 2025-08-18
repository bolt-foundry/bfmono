import * as React from "react";
import { BfDsProgressBar } from "../BfDsProgressBar.tsx";
import { BfDsButton } from "../BfDsButton.tsx";
import { BfDsCallout } from "../BfDsCallout.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsProgressBarExample() {
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [downloadProgress, setDownloadProgress] = React.useState(0);
  const [processingProgress, setProcessingProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const simulateProgress = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    activeSetter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    activeSetter(true);
    setter(0);

    const interval = setInterval(() => {
      setter((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          activeSetter(false);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // 5-20% increments
      });
    }, 300);
  };

  const resetProgress = () => {
    setUploadProgress(0);
    setDownloadProgress(0);
    setProcessingProgress(0);
    setIsUploading(false);
    setIsDownloading(false);
    setIsProcessing(false);
  };

  return (
    <div className="bfds-example">
      <h2 className="bfds-example__title">BfDsProgressBar Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsProgressBar } from "@bfmono/apps/bfDs/components/BfDsProgressBar.tsx";

// Basic usage
<BfDsProgressBar
  label="Upload Progress"
  value={75}
  formatValue={(val) => \`\${val}%\`}
/>

// All available props
<BfDsProgressBar
  value={50}                        // number - current progress value
  min={0}                          // number - minimum value (default: 0)
  max={100}                        // number - maximum value (default: 100)
  label="Progress"                 // string - label text
  showValue={true}                 // boolean - show current value (default: true)
  formatValue={(v) => v + "%"}     // (value: number) => string
  size="medium"                    // "small" | "medium" | "large" (default: "medium")
  state="default"                  // "default" | "error" | "success" | "warning"
  color="#007bff"                  // string - custom color for fill
  className=""                     // string - additional CSS classes
  helpText=""                      // string - help text below progress bar
  id=""                           // string - element ID (auto-generated if not provided)
/>`}
        />
      </div>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Interactive Demo</h3>
        <div className="bfds-example__items">
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <BfDsButton
              onClick={() =>
                simulateProgress(setUploadProgress, setIsUploading)}
              disabled={isUploading}
              variant="primary"
              size="small"
            >
              Start Upload
            </BfDsButton>
            <BfDsButton
              onClick={() =>
                simulateProgress(setDownloadProgress, setIsDownloading)}
              disabled={isDownloading}
              variant="secondary"
              size="small"
            >
              Start Download
            </BfDsButton>
            <BfDsButton
              onClick={() =>
                simulateProgress(setProcessingProgress, setIsProcessing)}
              disabled={isProcessing}
              variant="secondary"
              size="small"
            >
              Start Processing
            </BfDsButton>
            <BfDsButton
              onClick={resetProgress}
              variant="secondary"
              size="small"
            >
              Reset All
            </BfDsButton>
          </div>

          <BfDsProgressBar
            label="File Upload"
            value={Math.round(uploadProgress)}
            state={isUploading
              ? "default"
              : Math.round(uploadProgress) === 100
              ? "success"
              : "default"}
            helpText={isUploading
              ? "Uploading file..."
              : Math.round(uploadProgress) === 100
              ? "Upload complete!"
              : "Ready to upload"}
          />

          <BfDsProgressBar
            label="File Download"
            value={Math.round(downloadProgress)}
            formatValue={(val) => `${Math.round(val)}%`}
            state={isDownloading
              ? "default"
              : Math.round(downloadProgress) === 100
              ? "success"
              : "default"}
            helpText={isDownloading
              ? "Downloading file..."
              : Math.round(downloadProgress) === 100
              ? "Download complete!"
              : "Ready to download"}
          />

          <BfDsProgressBar
            label="Data Processing"
            value={Math.round(processingProgress)}
            color={isProcessing
              ? "#f59e0b"
              : Math.round(processingProgress) === 100
              ? "#10b981"
              : undefined}
            helpText={isProcessing
              ? "Processing data..."
              : Math.round(processingProgress) === 100
              ? "Processing complete!"
              : "Ready to process"}
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Sizes</h3>
        <div className="bfds-example__items">
          <BfDsProgressBar
            label="Small Progress Bar"
            size="small"
            value={30}
            helpText="Small size for compact layouts"
          />
          <BfDsProgressBar
            label="Medium Progress Bar (Default)"
            size="medium"
            value={65}
            helpText="Medium size for standard use"
          />
          <BfDsProgressBar
            label="Large Progress Bar"
            size="large"
            value={85}
            helpText="Large size for prominent display"
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">States</h3>
        <div className="bfds-example__items">
          <BfDsProgressBar
            label="Default State"
            value={45}
            helpText="Standard progress display"
          />
          <BfDsProgressBar
            label="Success State"
            state="success"
            value={100}
            helpText="Task completed successfully"
          />
          <BfDsProgressBar
            label="Warning State"
            state="warning"
            value={75}
            helpText="Progress with warning condition"
          />
          <BfDsProgressBar
            label="Error State"
            state="error"
            value={25}
            helpText="Progress stopped due to error"
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Custom Ranges & Formatting</h3>
        <div className="bfds-example__items">
          <BfDsProgressBar
            label="Memory Usage"
            value={6.8}
            min={0}
            max={16}
            formatValue={(val) => `${val.toFixed(1)} GB`}
            state={6.8 > 12 ? "error" : 6.8 > 10 ? "warning" : "default"}
            helpText="RAM usage out of 16GB total"
          />
          <BfDsProgressBar
            label="Test Coverage"
            value={87.5}
            formatValue={(val) => `${val.toFixed(1)}%`}
            state={87.5 >= 90 ? "success" : 87.5 >= 70 ? "warning" : "error"}
            helpText="Code test coverage percentage"
          />
          <BfDsProgressBar
            label="Storage Quota"
            value={450}
            min={0}
            max={500}
            formatValue={(val) => `${val} MB`}
            state={450 > 400 ? "error" : 450 > 350 ? "warning" : "default"}
            helpText="Storage usage out of 500MB quota"
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Custom Colors</h3>
        <div className="bfds-example__items">
          <BfDsProgressBar
            label="Health Score"
            value={92}
            color="#10b981"
            formatValue={(val) => `${val}/100`}
            helpText="System health is excellent"
          />
          <BfDsProgressBar
            label="Performance Score"
            value={76}
            color="#f59e0b"
            formatValue={(val) => `${val}%`}
            helpText="Performance needs improvement"
          />
          <BfDsProgressBar
            label="Security Score"
            value={45}
            color="#ef4444"
            formatValue={(val) => `${val}/100`}
            helpText="Security vulnerabilities detected"
          />
          <BfDsProgressBar
            label="Custom Brand Color"
            value={88}
            color="#8b5cf6"
            formatValue={(val) => `${val}%`}
            helpText="Using custom purple brand color"
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Value Display Options</h3>
        <div className="bfds-example__items">
          <BfDsProgressBar
            label="With Value Display (Default)"
            value={67}
            helpText="Shows progress value next to label"
          />
          <BfDsProgressBar
            label="Without Value Display"
            value={67}
            showValue={false}
            helpText="Clean look without numerical value"
          />
          <BfDsProgressBar
            label="Custom Formatted Value"
            value={3.7}
            min={0}
            max={5}
            formatValue={(val) => `${val.toFixed(1)} / 5.0 ⭐`}
            color="#f59e0b"
            helpText="Custom formatting for rating display"
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Real-World Examples</h3>
        <div className="bfds-example__items">
          <BfDsProgressBar
            label="AI Model Training"
            value={73}
            formatValue={(val) => `Epoch ${Math.floor(val / 10)} - ${val}%`}
            color="#3b82f6"
            helpText="Training deep learning model (ETA: 2h 15m)"
          />
          <BfDsProgressBar
            label="Backup Progress"
            value={156}
            min={0}
            max={1024}
            formatValue={(val) => `${val} MB / 1 GB`}
            state={156 > 900 ? "warning" : "default"}
            helpText="Backing up user data to cloud storage"
          />
          <BfDsProgressBar
            label="Code Analysis"
            value={4234}
            min={0}
            max={5000}
            formatValue={(val) => `${val.toLocaleString()} files`}
            helpText="Analyzing codebase for security vulnerabilities"
          />
          <BfDsProgressBar
            label="Build Pipeline"
            value={8}
            min={0}
            max={12}
            formatValue={(val) => `Step ${Math.floor(val)} of 12`}
            state={Math.floor(8) === 12 ? "success" : "default"}
            helpText="Compiling, testing, and deploying application"
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Accessibility Features</h3>
        <BfDsCallout variant="info">
          <h4>Built-in Accessibility</h4>
          <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
            <li>
              <strong>ARIA Attributes:</strong> Proper{" "}
              <code>role="progressbar"</code>, <code>aria-valuemin</code>,{" "}
              <code>aria-valuemax</code>, <code>aria-valuenow</code>, and{" "}
              <code>aria-valuetext</code>
            </li>
            <li>
              <strong>Semantic Labels:</strong>{" "}
              Labels are properly associated with progress bars using{" "}
              <code>htmlFor</code>
            </li>
            <li>
              <strong>Help Text:</strong> Additional context provided via{" "}
              <code>aria-describedby</code>
            </li>
            <li>
              <strong>Screen Reader Support:</strong>{" "}
              Custom formatters provide meaningful <code>aria-valuetext</code>
            </li>
            <li>
              <strong>Keyboard Navigation:</strong>{" "}
              Progress bars are focusable and announce current values
            </li>
          </ul>
        </BfDsCallout>
      </section>
    </div>
  );
}
