'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, X, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { skinAnalysisAPI, AnalysisResult } from '@/services/api/skin-analysis';

export function FloatingSkinAnalysis() {
  const router = useRouter();
  const { isLoggedIn, user, openSignIn } = useAuthContext();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleClick = () => {
    if (!isLoggedIn || user?.role?.id !== 3) {
      openSignIn();
      return;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Vui lòng chọn file hình ảnh.',
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Kích thước file không được vượt quá 10MB.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.',
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        setSelectedImage(imageData);
        closeCamera();
      }
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng chọn hoặc chụp hình ảnh trước.',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'skin-image.jpg', { type: 'image/jpeg' });

      const result = await skinAnalysisAPI.analyze(file);
      setAnalysisResult(result);
      
      toast({
        title: 'Thành công',
        description: 'Phân tích hình ảnh hoàn tất.',
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể phân tích hình ảnh. Vui lòng thử lại.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'Nhẹ';
      case 'moderate':
        return 'Trung bình';
      case 'severe':
        return 'Nghiêm trọng';
      default:
        return 'Không xác định';
    }
  };

  // Don't show if not logged in or not a patient
  if (!isLoggedIn || user?.role?.id !== 3) {
    return null;
  }

  return (
    <>
      {/* Floating Button - Simple & Professional */}
      <button
        onClick={handleClick}
        className="relative w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        aria-label="Phân tích da bằng AI"
      >
        {/* Main Icon */}
        <Sparkles className="w-6 h-6 text-white" />
        
        {/* Simple Badge Indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg pointer-events-none">
          Phân tích da AI
          <div className="absolute top-full right-4 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      </button>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-3 text-3xl font-bold">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              Phân tích da bằng AI
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Tải lên hoặc chụp ảnh để nhận diện tình trạng da một cách nhanh chóng và chính xác
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-8 mt-4">
            {/* Upload Section */}
            <div className="space-y-6 w-full">
              {!selectedImage ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-xl p-16 text-center hover:border-primary transition-all duration-300 bg-gradient-to-br from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20">
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-6 py-3 text-base hover:bg-primary hover:text-primary-foreground transition-colors"
                            size="lg"
                          >
                            <Upload className="w-5 h-5" />
                            Tải lên ảnh
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCameraClick}
                            className="flex items-center gap-2 px-6 py-3 text-base hover:bg-primary hover:text-primary-foreground transition-colors"
                            size="lg"
                          >
                            <Camera className="w-5 h-5" />
                            Chụp ảnh
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Hỗ trợ định dạng: JPG, PNG
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Kích thước tối đa: 10MB
                          </p>
                        </div>
                      </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={analysisResult?.image || selectedImage}
                    alt={analysisResult ? "Analyzed skin result" : "Selected skin"}
                    className="w-full h-auto rounded-lg border border-border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleReset}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedImage && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span className="text-base">Đang phân tích...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      <span className="text-base font-semibold">Phân tích hình ảnh</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-6 w-full">
              {!analysisResult ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium mb-2">Chưa có kết quả phân tích</p>
                  <p className="text-sm">
                    Vui lòng tải lên hoặc chụp ảnh và nhấn "Phân tích hình ảnh"
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Condition */}
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 p-6 rounded-xl border-2 border-primary/20 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-xl">Tình trạng phát hiện</h4>
                      <Badge className={`${getSeverityColor(analysisResult.severity)} text-sm px-3 py-1`}>
                        {getSeverityLabel(analysisResult.severity)}
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-primary mb-4">
                      {analysisResult.condition}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-muted-foreground">Độ tin cậy</span>
                        <span className="font-bold text-foreground">
                          {(analysisResult.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-background rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 rounded-full shadow-sm"
                          style={{ width: `${analysisResult.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-card p-5 rounded-lg border border-border">
                    <h4 className="font-semibold text-lg mb-3">Mô tả</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysisResult.description}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-card p-5 rounded-lg border border-border">
                    <h4 className="font-semibold text-lg mb-4">Khuyến nghị</h4>
                    <ul className="space-y-3">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm text-muted-foreground leading-relaxed flex-1">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Disclaimer */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Lưu ý:</strong> Kết quả phân tích chỉ mang tính chất tham khảo. 
                      Vui lòng tham khảo ý kiến bác sĩ chuyên khoa để có chẩn đoán chính xác.
                    </AlertDescription>
                  </Alert>

                  <Button
                    variant="outline"
                    onClick={() => {
                      handleClose();
                      router.push('/doctors');
                    }}
                    className="w-full"
                  >
                    Đặt lịch hẹn với bác sĩ
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Camera Modal */}
          {isCameraOpen && (
            <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
              <div className="bg-background rounded-lg p-6 max-w-2xl w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Chụp ảnh</h3>
                  <Button variant="ghost" size="icon" onClick={closeCamera}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-auto"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={closeCamera} variant="outline" className="flex-1">
                      Hủy
                    </Button>
                    <Button onClick={capturePhoto} className="flex-1">
                      <Camera className="w-4 h-4 mr-2" />
                      Chụp ảnh
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

