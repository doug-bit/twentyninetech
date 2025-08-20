import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateImageRequestSchema } from "@shared/schema";
import Replicate from "replicate";
import fs from "fs/promises";
import path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN || "",
});

// Ensure generated images directory exists
const IMAGES_DIR = path.join(process.cwd(), "generated_images");

async function ensureImagesDirectory() {
  try {
    await fs.access(IMAGES_DIR);
  } catch {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  }
}

async function downloadImage(url: string, filename: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const filePath = path.join(IMAGES_DIR, filename);
  const fileStream = createWriteStream(filePath);
  
  if (response.body) {
    const reader = response.body.getReader();
    const writer = fileStream;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        writer.write(value);
      }
    } finally {
      writer.end();
    }
  }
  
  return filePath;
}

function generateFilename(prompt: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedPrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `${timestamp}_${sanitizedPrompt}.png`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureImagesDirectory();
  
  // Base path for deployment
  const basePath = process.env.BASE_PATH || '';

  // Generate image endpoint
  app.post(`${basePath}/api/generate`, async (req, res) => {
    try {
      const { prompt } = generateImageRequestSchema.parse(req.body);

      // Call Replicate API - Using Flux with MM29 style (Maya-29 model requires special access)
      const output = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: `MM29 ${prompt}, Maya style, futuristic streetwear, high tech fashion, minimalist design, professional photography`,
            aspect_ratio: "3:4", // 3:4 aspect ratio for LED wall display
            num_outputs: 1,
            output_format: "png",
            output_quality: 90
          }
        }
      );

      console.log("Replicate output:", JSON.stringify(output, null, 2));

      // Handle different output formats from Replicate
      let imageUrl: string;
      if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0];
      } else if (typeof output === 'string') {
        imageUrl = output;
      } else {
        console.error("Unexpected output format:", output);
        throw new Error("No valid image URL in API response");
      }
      const filename = generateFilename(prompt);
      
      // Download and save image locally
      const localPath = await downloadImage(imageUrl, filename);
      
      // Get file stats for size
      const stats = await fs.stat(localPath);
      
      // Save to storage with local URL for frontend  
      const localUrl = `${basePath}/api/images/${filename}`;
      console.log("Saving image with localUrl:", localUrl);
      
      const savedImage = await storage.saveGeneratedImage({
        prompt,
        imageUrl: localUrl, // Use local URL instead of external
        localPath,
        fileSize: stats.size,
        resolution: "3:4",
        modelUsed: "flux-schnell-mm29-style",
      });

      console.log("Saved image data:", JSON.stringify(savedImage, null, 2));

      res.json({
        success: true,
        image: savedImage,
        message: "Image generated and saved successfully"
      });

    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to generate image"
      });
    }
  });

  // Get recent images
  app.get(`${basePath}/api/images/recent`, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 12;
      const images = await storage.getRecentImages(limit);
      res.json(images);
    } catch (error) {
      console.error("Error fetching recent images:", error);
      res.status(500).json({
        message: "Failed to fetch recent images"
      });
    }
  });

  // Get image count (must come before the generic image serving route)
  app.get(`${basePath}/api/images/count`, async (req, res) => {
    try {
      const count = await storage.getImageCount();
      res.json({ count });
    } catch (error) {
      console.error("Error getting image count:", error);
      res.status(500).json({ message: "Failed to get image count" });
    }
  });

  // Download endpoint - forces download with proper filename
  app.get(`${basePath}/api/download/:filename`, async (req, res) => {
    try {
      const filename = req.params.filename;
      const imagePath = path.join(IMAGES_DIR, filename);
      
      // Check if file exists
      await fs.access(imagePath);
      
      // Extract prompt from filename for better download name
      const promptMatch = filename.match(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_(.+)\.png$/);
      const promptPart = promptMatch ? promptMatch[1] : 'generated-image';
      const downloadFilename = `MM29-${promptPart}.png`;
      
      // Force download with proper headers
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Content-Transfer-Encoding', 'binary');
      
      // Send the file
      res.sendFile(path.resolve(imagePath));
    } catch (error) {
      console.error("Error downloading image:", error);
      res.status(404).json({ message: "Image not found" });
    }
  });

  // Serve generated images
  app.get(`${basePath}/api/images/:filename`, async (req, res) => {
    try {
      const filename = req.params.filename;
      const imagePath = path.join(IMAGES_DIR, filename);
      
      // Check if file exists
      await fs.access(imagePath);
      
      // Check if this is a download request
      const isDownload = req.query.download === 'true';
      
      if (isDownload) {
        // Set headers for download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        // Set headers for viewing
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
      
      // Send the file
      res.sendFile(path.resolve(imagePath));
    } catch (error) {
      console.error("Error serving image:", error);
      res.status(404).json({ message: "Image not found" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
