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
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/images/recent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/images/count"] });
        
        toast({
          title: "Image Generated Successfully",
          description: "Your image has been generated and saved locally.",
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

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = `/api/images/${currentImage.id}`;
      link.download = `generated-image-${currentImage.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    <div className="min-h-screen flex flex-col bg-surface relative">
      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Prompt Input */}
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                              placeholder="Describe your image..."
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
                      className="bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Wand2 />
                      )}
                      <span>{isGenerating ? "Generating..." : "Generate"}</span>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Image Display */}
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Image Container */}
            <div className="relative">
              {isGenerating ? (
                // Loading State
                <div className="aspect-square bg-gray-100 flex flex-col items-center justify-center">
                  <div className="flex space-x-2 mb-4">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <div className="w-64 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
                  </div>
                </div>
              ) : currentImage ? (
                // Generated Image Display
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                  <img 
                    src={`/api/images/${currentImage.id}`}
                    alt={`Generated image: ${currentImage.prompt}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Actions Overlay */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>


                </div>
              ) : (
                // Empty State
                <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="w-20 h-20 flex items-center justify-center mb-4">
                    <svg 
                      width="80" 
                      height="80" 
                      viewBox="0 0 80 80" 
                      className="opacity-60"
                    >
                      <rect width="80" height="80" fill="#000000" rx="8"/>
                      <text 
                        x="40" 
                        y="32" 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="12" 
                        fontWeight="bold" 
                        fontFamily="Arial, sans-serif"
                      >
                        HYPE
                      </text>
                      <text 
                        x="40" 
                        y="48" 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="12" 
                        fontWeight="bold" 
                        fontFamily="Arial, sans-serif"
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
      <div className="fixed bottom-4 left-4 z-50">
        <svg 
          width="120" 
          height="40" 
          viewBox="0 0 120 40" 
          className="opacity-80 hover:opacity-100 transition-opacity"
        >
          <rect width="120" height="40" fill="#E4002B" rx="4"/>
          <text 
            x="60" 
            y="28" 
            textAnchor="middle" 
            fill="white" 
            fontSize="18" 
            fontWeight="bold" 
            fontFamily="Arial, sans-serif"
          >
            lenovo
          </text>
        </svg>
      </div>
    </div>
  );
}
