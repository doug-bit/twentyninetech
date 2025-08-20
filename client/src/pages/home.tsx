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
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Wand2 className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Image Generator</h1>
                <p className="text-sm text-gray-500">Powered by FLUX Schnell Model</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Describe your image
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                              placeholder="A majestic mountain landscape at sunset with vibrant orange and purple skies..."
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                              {promptValue.length}/500
                            </div>
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
                      <span>{isGenerating ? "Generating..." : "Generate Image"}</span>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Image Display */}
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Status Bar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {isGenerating ? "Generating..." : "Ready to generate"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Download className="text-xs" />
                  <span>Auto-save enabled</span>
                </div>
                
                <div className="text-sm text-gray-500">
                  Images saved: <span className="font-semibold">{imageCountData?.count || 0}</span>
                </div>
              </div>
            </div>

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
                  <p className="text-lg font-semibold text-gray-700 mb-2">Generating your image...</p>
                  <p className="text-sm text-gray-500 mb-4">This may take 30-60 seconds</p>
                  <div className="w-64 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Processing with FLUX Schnell model...</p>
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

                  {/* Save Success Indicator */}
                  {showSaveSuccess && (
                    <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 transition-opacity duration-500">
                      <CheckCircle className="h-4 w-4" />
                      <span>Saved to local folder</span>
                    </div>
                  )}
                </div>
              ) : (
                // Empty State
                <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No image generated yet</h3>
                  <p className="text-gray-500 text-center max-w-sm">Enter a prompt above and click "Generate Image" to create your first AI-generated image.</p>
                </div>
              )}
            </div>

            {/* Image Info Panel */}
            {currentImage && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      <span className="font-semibold">Model:</span> {currentImage.modelUsed}
                    </span>
                    <span className="text-gray-600">
                      <span className="font-semibold">Resolution:</span> {currentImage.resolution}
                    </span>
                    <span className="text-gray-600">
                      <span className="font-semibold">Generated:</span> {new Date(currentImage.generatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {(currentImage.fileSize / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Recent Images */}
          {recentImages.length > 0 && (
            <Card className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recently Generated</h2>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-indigo-700">
                    <Folder className="h-4 w-4 mr-1" />
                    Open Folder
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recentImages.map((image) => (
                    <div 
                      key={image.id}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-200"
                      onClick={() => handleImageSelect(image)}
                    >
                      <img 
                        src={`/api/images/${image.id}`}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Powered by Replicate API</span>
            <span>•</span>
            <span>Maya-29 Model</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{imageCountData?.count || 0} generations total</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
