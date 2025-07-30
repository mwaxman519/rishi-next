&quot;use client&quot;;

import { useState, useCallback } from &quot;react&quot;;
import { useDropzone } from &quot;react-dropzone&quot;;
import { Upload, X, ImageIcon, Loader2 } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Card, CardContent } from &quot;@/components/ui/card&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import Image from &quot;next/image&quot;;

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, thumbnailUrl: string) => void;
  currentImageUrl?: string;
  currentThumbnailUrl?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageUpload,
  currentImageUrl,
  currentThumbnailUrl,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "&quot;);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);

      try {
        // Create preview
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        // Upload to server
        const formData = new FormData();
        formData.append(&quot;image&quot;, file);

        const response = await fetch(&quot;/api/upload/kit-template-image&quot;, {
          method: &quot;POST&quot;,
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || &quot;Upload failed&quot;);
        }

        const result = await response.json();
        
        // Call parent callback with URLs
        onImageUpload(result.imageUrl, result.thumbnailUrl);
        
        // Update preview to use server URL
        setPreviewUrl(result.imageUrl);
        
        toast({
          title: &quot;Success&quot;,
          description: `Image uploaded successfully using ${result.storage} storage`,
        });

      } catch (error) {
        console.error(&quot;Upload error:&quot;, error);
        toast({
          title: &quot;Upload Failed&quot;,
          description: error instanceof Error ? error.message : &quot;Failed to upload image&quot;,
          variant: &quot;destructive&quot;,
        });
        
        // Reset preview on error
        setPreviewUrl(currentImageUrl || &quot;&quot;);
      } finally {
        setUploading(false);
      }
    },
    [onImageUpload, currentImageUrl, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: disabled || uploading,
  });

  const clearImage = () => {
    setPreviewUrl(&quot;&quot;);
    onImageUpload(&quot;&quot;, &quot;&quot;);
  };

  return (
    <div className=&quot;space-y-4&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <label className=&quot;text-sm font-medium&quot;>Template Image</label>
        {previewUrl && (
          <Button
            type=&quot;button&quot;
            variant=&quot;ghost&quot;
            size=&quot;sm&quot;
            onClick={clearImage}
            disabled={disabled || uploading}
          >
            <X className=&quot;h-4 w-4&quot; />
            Remove
          </Button>
        )}
      </div>

      {previewUrl ? (
        <Card className=&quot;overflow-hidden&quot;>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;relative aspect-video bg-gray-100 rounded-lg overflow-hidden&quot;>
              <Image
                src={previewUrl}
                alt=&quot;Template preview&quot;
                fill
                className=&quot;object-cover&quot;
                unoptimized={previewUrl.startsWith('blob:')}
              />
              {uploading && (
                <div className=&quot;absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center&quot;>
                  <Loader2 className=&quot;h-8 w-8 animate-spin text-white&quot; />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className=&quot;flex flex-col items-center space-y-2&quot;>
                  <Loader2 className=&quot;h-12 w-12 animate-spin text-purple-600&quot; />
                  <p className=&quot;text-sm text-gray-600&quot;>Uploading...</p>
                </div>
              ) : (
                <div className=&quot;flex flex-col items-center space-y-2&quot;>
                  <div className=&quot;p-3 bg-gray-100 rounded-full&quot;>
                    {isDragActive ? (
                      <Upload className=&quot;h-8 w-8 text-purple-600&quot; />
                    ) : (
                      <ImageIcon className=&quot;h-8 w-8 text-gray-400&quot; />
                    )}
                  </div>
                  <div>
                    <p className=&quot;text-sm font-medium&quot;>
                      {isDragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className=&quot;text-xs text-gray-500">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}