import { CloudUpload, Delete, Visibility } from '@mui/icons-material';
import { Box, Button, IconButton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { TShowConfirm } from '../tShowConfirm';

// Utility function for handling images
const getImageUrl = (imagePath: string, baseUrl?: string): string => {
  const backendUrl = baseUrl || import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:6868';
  return `${backendUrl}/${imagePath}`;
};

interface SimpleImageUploadProps {
  value?: (string | File)[];
  onChange?: (images: (string | File)[]) => void;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  label?: string;
  maxHeight?: number;
  maxWidth?: number;
  // Props cho việc xóa ảnh từ server
  onDeleteFromServer?: (imagePath: string) => Promise<void>;
  donViId?: string;
  ngay?: string;
}

const SimpleImageUpload: React.FC<SimpleImageUploadProps> = ({
  value = [],
  onChange,
  multiple = true,
  accept = "image/*",
  disabled = false,
  label = "Hình ảnh",
  maxHeight = 500,
  maxWidth = 500,
  onDeleteFromServer,
}) => {
  const [images, setImages] = useState<(string | File)[]>(value);
  const [inputId] = useState(() => `image-upload-${Math.random().toString(36).substr(2, 9)}`);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    setImages(value);
    // Reset error state when images change
    setImageErrors(new Set());
  }, [value]);

  // Kiểm tra định dạng file ảnh
  const isValidImageFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    // Kiểm tra MIME type
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return false;
    }
    
    // Kiểm tra file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    return hasValidExtension;
  };

  // Xử lý upload file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    
    // Validate từng file
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    newFiles.forEach(file => {
      if (isValidImageFile(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });
    
    // Hiển thị lỗi nếu có file không hợp lệ
    if (invalidFiles.length > 0) {
      alert(`Các file sau không phải định dạng ảnh hợp lệ: ${invalidFiles.join(', ')}\n\nĐịnh dạng được hỗ trợ: JPG, PNG, GIF, WEBP, BMP`);
    }
    
    // Chỉ thêm file hợp lệ
    if (validFiles.length > 0) {
      if (multiple) {
        const updatedImages = [...images, ...validFiles];
        setImages(updatedImages);
        onChange?.(updatedImages);
      } else {
        setImages(validFiles);
        onChange?.(validFiles);
      }
    }

    event.target.value = '';
  };

  // Xử lý xóa ảnh - Hiển thị confirm dialog trước
  const handleRemoveClick = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteConfirm(true);
  };

  // Xác nhận xóa ảnh
  const confirmDelete = async () => {
    if (deleteIndex === null) return;
    
    const imageToRemove = images[deleteIndex];
    
    // Nếu là string (ảnh từ server) và có callback xóa từ server
    if (typeof imageToRemove === 'string' && onDeleteFromServer) {
      try {
        await onDeleteFromServer(imageToRemove);
      } catch (error) {
        console.error('Lỗi khi xóa ảnh từ server:', error);
        // Vẫn tiếp tục xóa khỏi UI dù server lỗi
      }
    }
    
    // Xóa khỏi local state
    const updatedImages = images.filter((_, i) => i !== deleteIndex);
    setImages(updatedImages);
    onChange?.(updatedImages);
    
    // Đóng dialog
    setShowDeleteConfirm(false);
    setDeleteIndex(null);
  };

  // Hủy xóa
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteIndex(null);
  };

  // Xử lý xem ảnh
  const handleView = (image: string | File) => {
    const src = typeof image === 'string' ? getImageUrl(image) : URL.createObjectURL(image);
    window.open(src, '_blank');
  };

  // Lấy URL ảnh
  const getImageSrc = (image: string | File): string => {
    if (typeof image === 'object' && 'name' in image) {
      return URL.createObjectURL(image as File);
    }
    return getImageUrl(image as string);
  };

  // Xử lý lỗi ảnh
  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]));
  };

  // Component fallback cho ảnh lỗi
  const ErrorThumbnail = ({ fileName, index }: { fileName: string; index: number }) => (
    <Box
      sx={{
        width: maxWidth,
        height: maxHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        color: '#666',
        textAlign: 'center',
        padding: '8px',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          fontSize: '24px',
          marginBottom: '8px',
          color: '#ff6b6b',
        }}
      >
        🖼️
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontSize: '10px',
          wordBreak: 'break-all',
          lineHeight: 1.2,
        }}
      >
        Không thể tải ảnh
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontSize: '8px',
          color: '#999',
          marginTop: '4px',
        }}
      >
        {fileName}
      </Typography>
      
      {/* Retry button */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setImageErrors(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          });
        }}
        sx={{
          position: 'absolute',
          top: 4,
          left: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          color: '#0A8DEE',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
          },
        }}
      >
        🔄
      </IconButton>
    </Box>
  );

  return (
    <Box>
      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      
      {/* Upload Button */}
      <Box sx={{ marginBottom: 2 }}>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: 'none' }}
          id={inputId}
        />
        <label htmlFor={inputId}>
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUpload />}
            disabled={disabled}
            sx={{
              borderStyle: 'dashed',
              borderWidth: 2,
              '&:hover': {
                borderStyle: 'dashed',
                borderWidth: 2,
              },
            }}
          >Chọn hình ảnh
          </Button>
        </label>
      </Box>

      {/* Image Grid - ĐƠN GIẢN HÓA */}
      {images.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ marginTop: 1, display: 'block' }}>
          Có {images.length} hình ảnh
        </Typography>
      )}
      {images.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 1 }}>
          {images.map((image, index) => {
            const imageSrc = getImageSrc(image);
            const fileName = typeof image === 'object' && 'name' in image 
              ? (image as File).name 
              : `Image ${index + 1}`;
            const hasError = imageErrors.has(index);

            return (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    border: '2px solid #0A8DEE',
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                }}
              >
                {hasError ? (
                  <ErrorThumbnail fileName={fileName} index={index} />
                ) : (
                  <img
                    src={imageSrc}
                    alt={fileName}
                    style={{
                      width: maxWidth,
                      height: maxHeight,
                      objectFit: 'cover' as const,
                      display: 'block',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleView(image)}
                    onError={() => handleImageError(index)}
                    title={`Click để xem phóng to - ${fileName}`}
                  />
                )}
                
                {/* Action Buttons - Hiển thị cho cả ảnh lỗi và ảnh bình thường */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    display: 'flex',
                    gap: 0.5,
                    opacity: 0,
                    transition: 'opacity 0.2s ease-in-out',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  {/* Nút xem - chỉ hiển thị khi không có lỗi */}
                  {!hasError && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(image);
                      }}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#0A8DEE',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        },
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  )}
                  
                  {/* Nút xóa - hiển thị cho cả ảnh lỗi và ảnh bình thường */}
                  {!disabled && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveClick(index); // ← Hiển thị confirm dialog
                      }}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#d32f2f',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                {/* File name overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    fontSize: '12px',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fileName}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}



      {/* Confirm Dialog */}
      <TShowConfirm
        visible={showDeleteConfirm}
        title="Xác nhận xóa ảnh"
        message="Bạn có chắc chắn muốn xóa ảnh này không? Hành động này không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        onClose={cancelDelete}
        okText="Xóa"
        cancelText="Hủy"
      />
    </Box>
  );
};

export default SimpleImageUpload;
