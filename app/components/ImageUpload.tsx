"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "");
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
        formData.append("image", file);

        const response = await fetch("/api/upload/kit-template-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const result = await response.json();
        
        // Call parent callback with URLs
        onImageUpload(result.imageUrl, result.thumbnailUrl);
        
        // Update preview to use server URL
        setPreviewUrl(result.imageUrl);
        
        toast({
          title: "Success",
          description: `Image uploaded successfully using ${result.storage} storage`,
        });

      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive",
        });
        
        // Reset preview on error
        setPreviewUrl(currentImageUrl || "");
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
    setPreviewUrl("");
    onImageUpload("", "");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Template Image</label>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearImage}
            disabled={disabled || uploading}
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      {previewUrl ? (
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="Template preview"
                fill
                className="object-cover"
                unoptimized={previewUrl.startsWith('blob:')}
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
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
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-gray-100 rounded-full">
                    {isDragActive ? (
                      <Upload className="h-8 w-8 text-purple-600" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isDragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">
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