import { exists } from "@std/fs";
import { getLogger } from "@bolt-foundry/logger";

const logger = getLogger(import.meta);

export async function generateWildcardCert(
  certPath: string,
  keyPath: string,
): Promise<void> {
  logger.info(
    "Generating self-signed wildcard certificate for *.codebot.local",
  );

  // Create OpenSSL config for wildcard certificate
  const opensslConfig = `
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = *.codebot.local

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.codebot.local
DNS.2 = codebot.local
`;

  // Write temporary config file
  const configPath = "/tmp/codebot-openssl.cnf";
  await Deno.writeTextFile(configPath, opensslConfig);

  try {
    // Generate private key and certificate in one command
    const command = new Deno.Command("openssl", {
      args: [
        "req",
        "-x509",
        "-nodes",
        "-days",
        "365",
        "-newkey",
        "rsa:2048",
        "-keyout",
        keyPath,
        "-out",
        certPath,
        "-config",
        configPath,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const output = await command.output();

    if (!output.success) {
      const stderr = new TextDecoder().decode(output.stderr);
      throw new Error(`Failed to generate certificate: ${stderr}`);
    }

    logger.info(`Certificate generated at: ${certPath}`);
    logger.info(`Private key generated at: ${keyPath}`);
  } finally {
    // Clean up temp config file
    try {
      await Deno.remove(configPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

export async function trustCertificate(certPath: string): Promise<void> {
  logger.info("Adding certificate to system trust store...");

  if (Deno.build.os === "darwin") {
    // macOS: Add to system keychain and trust
    logger.info("Detected macOS - adding certificate to system keychain");

    const command = new Deno.Command("sudo", {
      args: [
        "security",
        "add-trusted-cert",
        "-d",
        "-r",
        "trustRoot",
        "-k",
        "/Library/Keychains/System.keychain",
        certPath,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const output = await command.output();

    if (!output.success) {
      const stderr = new TextDecoder().decode(output.stderr);
      logger.warn(`Failed to trust certificate: ${stderr}`);
      logger.info(
        "You may need to manually trust the certificate in Keychain Access",
      );
    } else {
      logger.info("Certificate successfully added to system trust store");
    }
  } else if (Deno.build.os === "linux") {
    // Linux: Copy to system trust store
    logger.info("Detected Linux - adding certificate to ca-certificates");

    // First copy the certificate
    const copyCommand = new Deno.Command("sudo", {
      args: [
        "cp",
        certPath,
        "/usr/local/share/ca-certificates/codebot-wildcard.crt",
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const copyOutput = await copyCommand.output();

    if (!copyOutput.success) {
      const stderr = new TextDecoder().decode(copyOutput.stderr);
      logger.warn(`Failed to copy certificate: ${stderr}`);
      logger.info("You may need to manually trust the certificate");
      return;
    }

    // Update CA certificates
    const updateCommand = new Deno.Command("sudo", {
      args: ["update-ca-certificates"],
      stdout: "piped",
      stderr: "piped",
    });

    const updateOutput = await updateCommand.output();

    if (!updateOutput.success) {
      const stderr = new TextDecoder().decode(updateOutput.stderr);
      logger.warn(`Failed to update ca-certificates: ${stderr}`);
    } else {
      logger.info("Certificate successfully added to system trust store");
    }
  } else {
    logger.warn(`Unsupported OS: ${Deno.build.os}`);
    logger.info("Please manually trust the certificate at:", certPath);
  }

  logger.info(
    "You may need to restart your browser for the certificate to be recognized",
  );
}

export async function ensureWildcardCertificate(
  sharedCertDir: string,
): Promise<void> {
  const wildcardCertPath = `${sharedCertDir}/codebot-wildcard.pem`;
  const wildcardKeyPath = `${sharedCertDir}/codebot-wildcard-key.pem`;

  if (!await exists(wildcardCertPath)) {
    await Deno.mkdir(sharedCertDir, { recursive: true });

    // Generate self-signed wildcard certificate for *.codebot.local
    await generateWildcardCert(wildcardCertPath, wildcardKeyPath);

    // Trust the certificate in the system keychain (on host)
    await trustCertificate(wildcardCertPath);

    logger.info("Certificate generated and trusted for HTTPS support");
  } else {
    logger.info("Using existing wildcard certificate");
  }
}
