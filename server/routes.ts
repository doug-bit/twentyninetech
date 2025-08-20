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

  // Generate image endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt } = generateImageRequestSchema.parse(req.body);

      // Call Replicate API with Maya-29 model
      const output = await replicate.run(
        "mayaman/maya-29",
        {
          input: {
            prompt: `MM29 ${prompt}`, // Include trigger word for Maya model
            aspect_ratio: "3:4", // 3:4 aspect ratio for post feed format
            num_outputs: 1,
            num_inference_steps: 28,
            guidance_scale: 3.5,
            model: "dev",
            output_format: "png",
            output_quality: 90
          }
        }
      ) as string[];

      if (!output || output.length === 0) {
        throw new Error("No image generated from API");
      }

      const imageUrl = output[0];
      const filename = generateFilename(prompt);
      
      // Download and save image locally
      const localPath = await downloadImage(imageUrl, filename);
      
      // Get file stats for size
      const stats = await fs.stat(localPath);
      
      // Save to storage
      const savedImage = await storage.saveGeneratedImage({
        prompt,
        imageUrl,
        localPath,
        fileSize: stats.size,
        resolution: "3:4",
        modelUsed: "mayaman/maya-29",
      });

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
  app.get("/api/images/recent", async (req, res) => {
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

  // Get image count
  app.get("/api/images/count", async (req, res) => {
    try {
      const count = await storage.getImageCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching image count:", error);
      res.status(500).json({
        message: "Failed to fetch image count"
      });
    }
  });

  // Serve generated images
  app.get("/api/images/:id", async (req, res) => {
    try {
      const image = await storage.getImageById(req.params.id);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.sendFile(path.resolve(image.localPath));
    } catch (error) {
      console.error("Error serving image:", error);
      res.status(500).json({
        message: "Failed to serve image"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
