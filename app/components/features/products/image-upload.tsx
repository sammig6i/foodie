import type React from 'react'
import { useState, useRef, useCallback } from 'react'
import { ImageIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  onFileSelect?: (file: File) => void
  onFileRemove?: () => void
  className?: string
  disabled?: boolean
  maxSizeMB?: number
  id?: string
  initialImageUrl?: string | null
  error?: string | null
  showActions?: boolean
}

export function ImageUpload({
  onFileSelect,
  onFileRemove,
  className,
  disabled = false,
  maxSizeMB = 5,
  id = 'image-upload',
  initialImageUrl = null,
  error: externalError = null,
  showActions = true,
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayError = externalError || error

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file'
    }

    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setSelectedFile(file)

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      onFileSelect?.(file)
    },
    [onFileSelect, maxSizeMB],
  )

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    if (disabled) return

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedFile(null)
    setError(null)
    if (previewUrl && previewUrl !== initialImageUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileRemove?.()
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="aspect-square w-full max-w-xs mx-auto">
        {(selectedFile && previewUrl) || (!selectedFile && previewUrl) ? (
          <div
            className={cn(
              'relative w-full h-full rounded-lg border cursor-pointer hover:opacity-90 transition-opacity',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
            onClick={!disabled ? handleClick : undefined}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ) : (
          <div
            className={cn(
              'w-full h-full rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer',
              isDragOver && 'border-blue-400',
              disabled && 'opacity-50 cursor-not-allowed',
              displayError && 'border-red-600',
            )}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <ImageIcon className="size-12 text-muted-foreground/50" />
            <div className="text-center space-y-2">
              <div>
                <p className="text-base font-semibold text-foreground/80">
                  Upload Product Image
                </p>
                <p className="text-sm text-muted-foreground/80">
                  Click or drag to add an image
                </p>
              </div>
              <div className="text-xs text-muted-foreground/60 bg-muted/40 px-3 py-1.5 rounded-md">
                Supports JPG, PNG • Max 5MB
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {showActions &&
        ((selectedFile && previewUrl) || (!selectedFile && previewUrl)) && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Button
              type="button"
              size="sm"
              onClick={handleClick}
              variant="outline"
              disabled={disabled}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Replace
            </Button>
            {!disabled && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                // className="text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        )}

      {displayError && (
        <div className="text-sm text-red-600 text-center mt-2">
          {displayError}
        </div>
      )}

      {selectedFile && (
        <div className="text-center text-xs text-muted-foreground">
          {selectedFile.name} • {(selectedFile.size / 1024 / 1024).toFixed(2)}{' '}
          MB
        </div>
      )}
    </div>
  )
}
