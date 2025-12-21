'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, X, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { skinAnalysisAPI } from '@/services/api/skin-analysis';

interface AnalysisResult {
  condition: string;
  confidence: number;
  description: string;
  recommendations: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

export default function SkinAnalysisPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Redirect if not logged in or not a patient
  useEffect(() => {
    if (!isLoggedIn || user?.role?.id !== 3) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.role?.id]);

  // Don't render if not logged in or not a patient
  if (!isLoggedIn || user?.role?.id !== 3) {
    return null;
  }

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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
      // Convert base64 to blob
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={logout}
        onSignIn={openSignIn}
        onSignUp={openSignUp}
      />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Phân tích da bằng AI
              </h1>
              <p className="text-muted-foreground mt-1">
                Tải lên hoặc chụp ảnh để nhận diện tình trạng da
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
              <CardDescription>
                Tải lên hoặc chụp ảnh vùng da cần phân tích
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedImage ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
                    <div className="space-y-4">
                      <div className="flex justify-center gap-4">
                        <Button
                          variant="outline"
                          onClick={handleUploadClick}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Tải lên ảnh
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCameraClick}
                          className="flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Chụp ảnh
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Hỗ trợ: JPG, PNG (tối đa 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected skin"
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
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Phân tích hình ảnh
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Kết quả phân tích</CardTitle>
              <CardDescription>
                Thông tin về tình trạng da được phát hiện
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analysisResult ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có kết quả phân tích</p>
                  <p className="text-sm mt-2">
                    Vui lòng tải lên hoặc chụp ảnh và nhấn "Phân tích hình ảnh"
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Condition */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">Tình trạng phát hiện</h3>
                      <Badge className={getSeverityColor(analysisResult.severity)}>
                        {getSeverityLabel(analysisResult.severity)}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-1">
                      {analysisResult.condition}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Độ tin cậy: {(analysisResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold mb-2">Mô tả</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {analysisResult.description}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold mb-3">Khuyến nghị</h4>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{rec}</span>
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
                    onClick={() => router.push('/doctors')}
                    className="w-full"
                  >
                    Đặt lịch hẹn với bác sĩ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Chụp ảnh</CardTitle>
                  <Button variant="ghost" size="icon" onClick={closeCamera}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

