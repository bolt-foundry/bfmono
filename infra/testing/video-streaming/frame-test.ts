#!/usr/bin/env -S deno run --allow-net --allow-read

// Test sending actual PNG frame to streaming server

// Create a simple 1x1 PNG (minimal valid PNG data)
const pngData = new Uint8Array([
  137,
  80,
  78,
  71,
  13,
  10,
  26,
  10, // PNG signature
  0,
  0,
  0,
  13, // IHDR chunk length
  73,
  72,
  68,
  82, // IHDR
  0,
  0,
  0,
  1, // width: 1
  0,
  0,
  0,
  1, // height: 1
  8,
  2, // bit depth: 8, color type: 2 (RGB)
  0,
  0,
  0, // compression, filter, interlace
  144,
  119,
  83,
  222, // CRC
  0,
  0,
  0,
  12, // IDAT chunk length
  73,
  68,
  65,
  84, // IDAT
  8,
  153,
  99,
  248,
  15,
  0,
  0,
  1,
  0,
  1, // compressed image data
  53,
  174,
  157,
  25, // CRC
  0,
  0,
  0,
  0, // IEND chunk length
  73,
  69,
  78,
  68, // IEND
  174,
  66,
  96,
  130, // CRC
]);

console.log("Sending test PNG frame to streaming server...");

const base64Frame = btoa(String.fromCharCode(...pngData));

try {
  const response = await fetch("http://localhost:8080/stream-frame", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frame: base64Frame, test: "frame-test" }),
  });

  if (response.ok) {
    console.log("✅ Frame sent successfully!");
    console.log(
      "📺 Check http://localhost:8080/e2e-viewer to see if it appears",
    );
  } else {
    console.log("❌ Failed to send frame:", response.status);
  }
} catch (error) {
  console.log("❌ Error sending frame:", error);
}
