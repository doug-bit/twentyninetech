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
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Prompt Input */}
          <Card className="bg-card tech-border silver-glow">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              rows={4}
                              className="w-full px-6 py-4 bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/50 resize-none text-foreground placeholder-muted-foreground font-mono text-sm transition-all duration-300"
                              placeholder="DESCRIBE YOUR VISION..."
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-end">
                    <Button 
                      type="submit" 
                      disabled={isGenerating || !promptValue.trim()}
                      className="bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-4 font-mono font-bold text-sm tracking-wider transition-all duration-300 tech-glow cyber-text disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : (
                        <Wand2 className="mr-2" />
                      )}
                      <span>{isGenerating ? "PROCESSING..." : "GENERATE"}</span>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Image Display */}
          <Card className="bg-card tech-border overflow-hidden">
            {/* Image Container */}
            <div className="relative">
              {isGenerating ? (
                // Loading State
                <div className="aspect-square bg-muted flex flex-col items-center justify-center">
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
                <div className="aspect-square relative tech-glow">
                  <img 
                    src={`/api/images/${currentImage.id}`}
                    alt={`Generated image: ${currentImage.prompt}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Actions Overlay */}
                  <div className="absolute top-6 right-6 flex space-x-3">
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="bg-card/95 hover:bg-card border border-border text-foreground backdrop-blur-sm tech-border"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="bg-card/95 hover:bg-card border border-border text-foreground backdrop-blur-sm tech-border"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                // Empty State
                <div className="aspect-square bg-muted flex flex-col items-center justify-center border-2 border-dashed border-border">
                  <div className="w-24 h-24 flex items-center justify-center mb-6">
                    <svg 
                      width="96" 
                      height="96" 
                      viewBox="0 0 96 96" 
                      className="opacity-70"
                    >
                      <rect width="96" height="96" fill="#000000" rx="4"/>
                      <text 
                        x="48" 
                        y="38" 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="14" 
                        fontWeight="bold" 
                        fontFamily="JetBrains Mono, monospace"
                        letterSpacing="0.1em"
                      >
                        HYPE
                      </text>
                      <text 
                        x="48" 
                        y="58" 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="14" 
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
