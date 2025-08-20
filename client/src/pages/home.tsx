import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2, Download, Share2, Folder, Image, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { generateImageRequestSchema, type GeneratedImage, type GenerateImageRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateImageRequest>({
    resolver: zodResolver(generateImageRequestSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const promptValue = form.watch("prompt");

  // Fetch recent images
  const { data: recentImages = [] } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images/recent"],
  });

  // Fetch image count
  const { data: imageCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/images/count"],
  });

  // Generate image mutation
  const generateMutation = useMutation({
    mutationFn: async (data: GenerateImageRequest) => {
      const response = await apiRequest("POST", "/api/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCurrentImage(data.image);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        
        // Automatically download the image to user's computer
        downloadImageToComputer(data.image.id, data.image.prompt);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/images/recent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/images/count"] });
        
        toast({
          title: "Image Generated Successfully",
          description: "Your image has been generated and downloaded.",
        });
        
        form.reset();
      }
    },
    onError: (error) => {
      console.error("Generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateImageRequest) => {
    generateMutation.mutate(data);
  };

  const handleImageSelect = (image: GeneratedImage) => {
    setCurrentImage(image);
  };

  const downloadImageToComputer = (imageId: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = `/api/images/${imageId}`;
    link.download = `generated-image-${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    if (currentImage) {
      downloadImageToComputer(currentImage.id, currentImage.prompt);
    }
  };

  const handleShare = () => {
    if (currentImage) {
      navigator.clipboard.writeText(currentImage.prompt);
      toast({
        title: "Prompt Copied",
        description: "The image prompt has been copied to your clipboard.",
      });
    }
  };

  const isGenerating = generateMutation.isPending;

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Main Content - Single Page Layout */}
      <main className="flex-1 p-4 flex flex-col">
        <div className="max-w-5xl mx-auto flex-1 flex flex-col gap-4">
          
          {/* Image Display - Top Section (60% height) */}
          <Card className="bg-card tech-border overflow-hidden flex-[3]">
            <div className="relative h-full">
              {isGenerating ? (
                // Loading State
                <div className="h-full bg-muted flex flex-col items-center justify-center">
                  <div className="flex space-x-3 mb-8">
                    <div className="w-4 h-4 bg-primary animate-pulse"></div>
                    <div className="w-4 h-4 bg-accent animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-4 h-4 bg-primary animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                  <div className="w-80 bg-border h-1 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-accent h-full animate-pulse transition-all duration-1000" style={{ width: '60%' }}></div>
                  </div>
                  <div className="mt-6 text-muted-foreground cyber-text text-xs tracking-widest">
                    NEURAL PROCESSING
                  </div>
                </div>
              ) : currentImage ? (
                // Generated Image Display
                <div className="h-full relative tech-glow">
                  <img 
                    src={`/api/images/${currentImage.id}`}
                    alt={`Generated image: ${currentImage.prompt}`}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Image Actions Overlay */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="bg-card/95 hover:bg-card border border-border text-foreground backdrop-blur-sm tech-border"
                      onClick={handleDownload}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="bg-card/95 hover:bg-card border border-border text-foreground backdrop-blur-sm tech-border"
                      onClick={handleShare}
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                // Empty State
                <div className="h-full bg-muted flex flex-col items-center justify-center border-2 border-dashed border-border">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <svg 
                      width="80" 
                      height="80" 
                      viewBox="0 0 80 80" 
                      className="opacity-70"
                    >
                      <rect width="80" height="80" fill="#000000" rx="4"/>
                      <text 
                        x="40" 
                        y="32" 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="12" 
                        fontWeight="bold" 
                        fontFamily="JetBrains Mono, monospace"
                        letterSpacing="0.1em"
                      >
                        HYPE
                      </text>
                      <text 
                        x="40" 
                        y="52" 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="12" 
                        fontWeight="bold" 
                        fontFamily="JetBrains Mono, monospace"
                        letterSpacing="0.1em"
                      >
                        BEAST
                      </text>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Prompt Input - Bottom Section (40% height) */}
          <Card className="bg-card tech-border silver-glow flex-[2]">
            <CardContent className="p-6 h-full">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="w-full h-full resize-none px-4 py-3 bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground font-mono text-sm transition-all duration-300"
                            placeholder="DESCRIBE YOUR VISION..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-end">
                    <Button 
                      type="submit" 
                      disabled={isGenerating || !promptValue.trim()}
                      className="bg-primary hover:bg-primary/80 text-primary-foreground px-6 py-3 font-mono font-bold text-sm tracking-wider transition-all duration-300 tech-glow cyber-text disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      <span>{isGenerating ? "PROCESSING..." : "GENERATE"}</span>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

        </div>
      </main>



      {/* Fixed Lenovo Logo */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="tech-border silver-glow p-3">
          <svg 
            width="120" 
            height="40" 
            viewBox="0 0 120 40" 
            className="opacity-90 hover:opacity-100 transition-opacity"
          >
            <rect width="120" height="40" fill="#E4002B" rx="2"/>
            <text 
              x="60" 
              y="28" 
              textAnchor="middle" 
              fill="white" 
              fontSize="16" 
              fontWeight="bold" 
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.05em"
            >
              LENOVO
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
