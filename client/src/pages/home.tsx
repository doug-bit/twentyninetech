import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2, Download, Share2, Folder, Image, CheckCircle, AlertCircle, Loader2, Home as HomeIcon } from "lucide-react";
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
  const [showImageResult, setShowImageResult] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateImageRequest>({
    resolver: zodResolver(generateImageRequestSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const promptValue = form.watch("prompt");
  
  // Calculate word count
  const wordCount = promptValue ? promptValue.trim().split(/\s+/).filter(word => word.length > 0).length : 0;

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
        
        // Show image briefly, then auto-hide to keep interface ready for next user
        setShowImageResult(true);
        setTimeout(() => {
          setShowImageResult(false);
          setCurrentImage(null);
          form.reset(); // Clear form for next user
        }, 5000); // Show image for 5 seconds
        
        // Automatically download the image to user's computer
        downloadImageToComputer(data.image.id, data.image.prompt);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/images/recent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/images/count"] });
        
        toast({
          title: "Image Generated Successfully",
          description: "Your image has been generated and downloaded.",
        });
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
      {/* Main Content - Maximized Layout */}
      <main className="flex-1 p-6 flex flex-col">
        <div className="max-w-6xl mx-auto flex-1 flex flex-col gap-4">
          
          {/* Image Display - LED Wall 3:4 Aspect Ratio (3 units wide by 4 units tall) */}
          <div className="w-full max-w-4xl mx-auto aspect-[3/4] relative">
            {isGenerating ? (
              // Loading State
              <div className="w-full h-full bg-muted flex flex-col items-center justify-center tech-border">
                <div className="flex space-x-2 mb-4">
                  <div className="w-2 h-2 bg-primary animate-pulse"></div>
                  <div className="w-2 h-2 bg-accent animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-2 h-2 bg-primary animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
                <div className="w-48 bg-border h-0.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-accent h-full animate-pulse transition-all duration-1000" style={{ width: '60%' }}></div>
                </div>
                <div className="mt-3 text-accent/80 font-mono text-xs tracking-[0.3em] font-light">
                  PROCESSING
                </div>
              </div>
            ) : currentImage && showImageResult ? (
              // Generated Image Display
              <div className="w-full h-full relative tech-border overflow-hidden">
                <img 
                  src={`/api/images/${currentImage.id}`}
                  alt={`Generated image: ${currentImage.prompt}`}
                  className="w-full h-full object-cover bg-card"
                />
                
                {/* Image Actions Overlay */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button 
                    size="sm"
                    variant="secondary"
                    className="bg-card/95 hover:bg-card border border-border text-foreground backdrop-blur-sm w-7 h-7 p-0"
                    onClick={handleDownload}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="secondary"
                    className="bg-card/95 hover:bg-card border border-border text-foreground backdrop-blur-sm w-7 h-7 p-0"
                    onClick={handleShare}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="w-full h-full bg-muted flex flex-col items-center justify-center tech-border border-dashed">
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg 
                    width="48" 
                    height="48" 
                    viewBox="0 0 48 48" 
                    className="opacity-60"
                  >
                    <rect width="48" height="48" fill="#000000" rx="2"/>
                    <text 
                      x="24" 
                      y="20" 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize="8" 
                      fontWeight="bold" 
                      fontFamily="JetBrains Mono, monospace"
                      letterSpacing="0.1em"
                    >
                      HYPE
                    </text>
                    <text 
                      x="24" 
                      y="32" 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize="8" 
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

          {/* Sleek Prompt Input - Scaled Up */}
          <div className="tech-border silver-glow bg-card/30 backdrop-blur-sm max-w-4xl mx-auto w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          className="w-full px-6 py-4 bg-input/50 border-0 focus:bg-input/80 text-black dark:text-white placeholder-accent/60 font-mono text-base transition-all duration-500 resize-none tracking-wide leading-relaxed font-medium"
                          placeholder="describe your vision"
                          maxLength={400}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <div className="text-sm font-mono text-accent/70 tracking-[0.2em] font-light">
                    {wordCount}/60
                    {wordCount > 60 && (
                      <span className="text-primary/80 ml-3 font-medium">limit exceeded</span>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isGenerating || !promptValue.trim() || wordCount > 60}
                    className="bg-primary/90 hover:bg-primary text-primary-foreground px-8 py-3 font-mono font-medium text-sm tracking-[0.15em] transition-all duration-500 tech-glow disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    <span className="lowercase">{isGenerating ? "processing" : "generate"}</span>
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Image Carousel */}
          {recentImages.length > 0 && (
            <div className="relative h-16 overflow-hidden">
              <div className="flex space-x-2 animate-scroll">
                {recentImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex-shrink-0 w-16 h-16 relative"
                    style={{
                      filter: `blur(${Math.min(index * 0.3, 2)}px)`,
                      opacity: Math.max(1 - index * 0.08, 0.3),
                    }}
                  >
                    <img
                      src={`/api/images/${image.id}`}
                      alt=""
                      className="w-full h-full object-cover tech-border cursor-pointer hover:filter-none transition-all duration-300"
                      onClick={() => setCurrentImage(image)}
                    />
                  </div>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
          )}

          {/* Auto-reset message - shows briefly when image is generated */}
          {showSaveSuccess && (
            <div className="flex items-center justify-center">
              <div className="bg-primary/10 border border-primary/20 rounded px-4 py-2 text-primary font-mono text-sm">
                Image generated! Interface will reset for next user...
              </div>
            </div>
          )}

        </div>
      </main>



      {/* Fixed Lenovo Logo */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="tech-border silver-glow p-2 bg-card/20 backdrop-blur-sm">
          <svg 
            width="100" 
            height="32" 
            viewBox="0 0 100 32" 
            className="opacity-80 hover:opacity-100 transition-all duration-500"
          >
            <rect width="100" height="32" fill="#E4002B" rx="1"/>
            <text 
              x="50" 
              y="22" 
              textAnchor="middle" 
              fill="white" 
              fontSize="13" 
              fontWeight="500" 
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.1em"
            >
              LENOVO
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
