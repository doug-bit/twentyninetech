import { type User, type InsertUser, type GeneratedImage, type InsertImage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Image storage methods
  saveGeneratedImage(image: InsertImage): Promise<GeneratedImage>;
  getRecentImages(limit?: number): Promise<GeneratedImage[]>;
  getImageById(id: string): Promise<GeneratedImage | undefined>;
  getImageCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private images: Map<string, GeneratedImage>;

  constructor() {
    this.users = new Map();
    this.images = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveGeneratedImage(insertImage: InsertImage): Promise<GeneratedImage> {
    const id = randomUUID();
    const image: GeneratedImage = {
      ...insertImage,
      id,
      modelUsed: insertImage.modelUsed || "bytedance/sdxl-lightning-4step",
      generatedAt: new Date(),
    };
    this.images.set(id, image);
    return image;
  }

  async getRecentImages(limit: number = 12): Promise<GeneratedImage[]> {
    const images = Array.from(this.images.values());
    return images
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
      .slice(0, limit);
  }

  async getImageById(id: string): Promise<GeneratedImage | undefined> {
    return this.images.get(id);
  }

  async getImageCount(): Promise<number> {
    return this.images.size;
  }
}

export const storage = new MemStorage();
