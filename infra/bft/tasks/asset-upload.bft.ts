import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { ui } from "@bfmono/packages/tui/tui.ts";
import type { TaskDefinition } from "@bfmono/infra/bft/bft.ts";
import { parseArgs } from "@std/cli";
import { basename } from "@std/path";

export async function assetUploadCommand(
  options: Array<string>,
): Promise<number> {
  // Handle help
  if (options.includes("--help") || options.includes("-h")) {
    ui.output(`Usage: bft asset-upload <file...> [options]
    
Upload assets to CDN and return URLs.

Options:
  --help, -h     Show this help message
  --debug        List available buckets for debugging
  
Examples:
  bft asset-upload image.jpg`);
    return 0;
  }

  // Handle debug mode
  if (options.includes("--debug")) {
    try {
      const buckets = await listBuckets();
      ui.output("Available buckets:");
      for (const bucket of buckets) {
        ui.output(`  - ${bucket}`);
      }
      return 0;
    } catch (error) {
      ui.error(
        `Debug failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return 1;
    }
  }

  const args = parseArgs(options, {
    boolean: ["verbose", "v"],
    alias: { v: "verbose" },
    "--": true,
  });

  const verbose = args.verbose || args.v;
  const files = args._ as Array<string>;

  if (files.length === 0) {
    ui.error("No files specified. Use --help for usage information.");
    return 1;
  }

  try {
    // Process each file
    for (const filePath of files) {
      await processFile(filePath, verbose);
    }
    return 0;
  } catch (error) {
    ui.debug(`Full error details: ${error}`);
    ui.error(
      `Upload failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }
}

async function processFile(filePath: string, verbose: boolean): Promise<void> {
  if (verbose) {
    ui.output(`Processing: ${filePath}`);
  }

  // Check if file exists
  try {
    await Deno.stat(filePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }

  // Read file and calculate hash
  const fileData = await Deno.readFile(filePath);
  const hash = await calculateHash(fileData);
  const fileName = basename(filePath);

  if (verbose) {
    ui.output(`  Hash: ${hash}`);
    ui.output(`  Size: ${fileData.length} bytes`);
  }

  // Check if asset already exists
  const exists = await checkAssetExists(hash, fileName);
  if (exists) {
    if (verbose) {
      ui.output(`  Already exists, skipping upload`);
    }
  } else {
    // Upload to S3
    await uploadToS3(hash, fileName, fileData, verbose);
  }

  // For R2, the CDN URL is the primary URL
  const cdnUrl = `https://bltcdn.com/assets/${hash}/${fileName}`;
  ui.output(cdnUrl);

  // Also show S3 API URL if in verbose mode
  if (verbose) {
    const bucketName = S3_CONFIG.bucket;
    const s3ApiUrl =
      `https://${S3_CONFIG.host}/${bucketName}/assets/${hash}/${fileName}`;
    ui.output(`  S3 API URL: ${s3ApiUrl}`);
  }
}

// S3 configuration (works with both R2 and other S3-compatible storage)
// For Cloudflare R2:
//   - ASSET_STORAGE_HOST: "{account_id}.r2.cloudflarestorage.com"
//   - ASSET_STORAGE_BUCKET: "bft-assets"
//   - ASSET_STORAGE_REGION: "auto"
//   - AWS_ACCESS_KEY_ID: Your R2 access key
//   - AWS_SECRET_ACCESS_KEY: Your R2 secret key
const S3_CONFIG = {
  region: getConfigurationVariable("ASSET_STORAGE_REGION") || "auto",
  host: getConfigurationVariable("ASSET_STORAGE_HOST") ||
    "hel1.your-objectstorage.com",
  bucket: getConfigurationVariable("ASSET_STORAGE_BUCKET") ||
    "bft-assets",
};

// Helper function to create HMAC
async function hmac(key: Uint8Array, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(data),
  );
  return new Uint8Array(signature);
}

// Helper function to hash with SHA256
async function sha256(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === "string"
    ? new TextEncoder().encode(data)
    : data;
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

// Create AWS v4 signature
async function createAwsSignature(
  method: string,
  path: string,
  headers: Record<string, string>,
  payload: string | Uint8Array = "",
): Promise<string> {
  // Support both S3_* and AWS_* variable names for compatibility
  const accessKey = getConfigurationVariable("S3_ACCESS_KEY") ||
    getConfigurationVariable("AWS_ACCESS_KEY_ID");
  const secretKey = getConfigurationVariable("S3_SECRET_KEY") ||
    getConfigurationVariable("AWS_SECRET_ACCESS_KEY");

  if (!accessKey || !secretKey) {
    throw new Error(
      "S3 credentials not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (or S3_ACCESS_KEY and S3_SECRET_KEY) environment variables.",
    );
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, "");
  const date = timestamp.substr(0, 8);

  const payloadHash = await sha256(payload);

  // Add required headers
  headers["host"] = S3_CONFIG.host;
  headers["x-amz-date"] = timestamp;
  headers["x-amz-content-sha256"] = payloadHash;

  // Create canonical request
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key.toLowerCase()}:${headers[key]}`)
    .join("\n") + "\n";

  const signedHeaders = Object.keys(headers)
    .sort()
    .map((key) => key.toLowerCase())
    .join(";");

  const canonicalRequest =
    `${method}\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // Create string to sign
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${date}/${S3_CONFIG.region}/s3/aws4_request`;
  const stringToSign =
    `${algorithm}\n${timestamp}\n${credentialScope}\n${await sha256(
      canonicalRequest,
    )}`;

  // Calculate signature
  const dateKey = await hmac(
    new TextEncoder().encode(`AWS4${secretKey}`),
    date,
  );
  const dateRegionKey = await hmac(dateKey, S3_CONFIG.region);
  const dateRegionServiceKey = await hmac(dateRegionKey, "s3");
  const signingKey = await hmac(dateRegionServiceKey, "aws4_request");
  const signature = await hmac(signingKey, stringToSign);
  const signatureHex = Array.from(signature).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");

  return `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;
}

// List buckets for debug
async function listBuckets(): Promise<Array<string>> {
  const headers: Record<string, string> = {};
  const authorization = await createAwsSignature("GET", "/", headers);

  const response = await fetch(`https://${S3_CONFIG.host}/`, {
    method: "GET",
    headers: {
      ...headers,
      "Authorization": authorization,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to list buckets: ${response.status} ${response.statusText}`,
    );
  }

  const text = await response.text();
  const buckets: Array<string> = [];
  const bucketMatches = text.matchAll(/<Name>([^<]+)<\/Name>/g);
  for (const match of bucketMatches) {
    buckets.push(match[1]);
  }

  return buckets;
}

async function checkAssetExists(
  hash: string,
  fileName: string,
): Promise<boolean> {
  try {
    const key = `assets/${hash}/${fileName}`;
    const path = `/${S3_CONFIG.bucket}/${key}`;
    const headers: Record<string, string> = {};
    const authorization = await createAwsSignature("HEAD", path, headers);

    const response = await fetch(`https://${S3_CONFIG.host}${path}`, {
      method: "HEAD",
      headers: {
        ...headers,
        "Authorization": authorization,
      },
    });

    return response.ok;
  } catch (_error) {
    return false;
  }
}

async function uploadToS3(
  hash: string,
  fileName: string,
  data: Uint8Array,
  verbose: boolean,
): Promise<void> {
  if (verbose) {
    ui.output(`  Uploading to S3...`);
  }

  const key = `assets/${hash}/${fileName}`;
  const path = `/${S3_CONFIG.bucket}/${key}`;
  const contentType = getMimeType(fileName);

  const headers: Record<string, string> = {
    "content-type": contentType,
    "cache-control": "public, max-age=31536000, immutable",
  };

  const authorization = await createAwsSignature("PUT", path, headers, data);

  const response = await fetch(`https://${S3_CONFIG.host}${path}`, {
    method: "PUT",
    headers: {
      ...headers,
      "Authorization": authorization,
    },
    body: data,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Upload failed: ${response.status} ${response.statusText}\n${errorText}`,
    );
  }

  if (verbose) {
    ui.output(`  Upload complete`);
  }
}

export function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "svg": "image/svg+xml",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "pdf": "application/pdf",
    "txt": "text/plain",
    "md": "text/markdown",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

export async function calculateHash(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 8); // Use first 8 chars for shorter URLs
}

// Export the task definition for autodiscovery
export const bftDefinition = {
  description: "Upload assets to CDN and return URLs",
  fn: assetUploadCommand,
} satisfies TaskDefinition;
