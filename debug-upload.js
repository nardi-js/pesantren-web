// Simple script to test the gallery upload API
const fs = require("fs");
const path = require("path");

// Create a simple test image file (1x1 pixel PNG)
const createTestImage = () => {
  // Simple 1x1 transparent PNG as base64
  const pngData = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77ygAAAABJRU5ErkJggg==",
    "base64"
  );
  return pngData;
};

// Test the upload
async function testUpload() {
  try {
    const testImageBuffer = createTestImage();

    // Create a simple blob to simulate file upload
    const formData = new FormData();

    // Create a test file
    const testFile = new File([testImageBuffer], "test.png", {
      type: "image/png",
    });

    formData.append("title", "Test Gallery Item");
    formData.append("description", "Test description");
    formData.append("type", "image");
    formData.append("category", "Events");
    formData.append("status", "draft");
    formData.append("featured", "false");
    formData.append("tags", "[]");
    formData.append("coverImage", testFile);
    formData.append("image", testFile);
    formData.append("caption", "Test caption");
    formData.append("altText", "Test alt text");

    console.log("📤 Sending test upload request...");

    const response = await fetch("http://localhost:3001/api/admin/gallery", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    console.log("📥 Response status:", response.status);
    console.log("📥 Response data:", result);

    if (!response.ok) {
      console.error("❌ Upload failed:", result);
    } else {
      console.log("✅ Upload successful:", result);
    }
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Run the test if this script is executed directly
if (typeof window !== "undefined") {
  // Browser environment
  testUpload();
} else {
  console.log("This script should be run in a browser environment");
  console.log(
    "Copy and paste the testUpload function into the browser console"
  );
}
