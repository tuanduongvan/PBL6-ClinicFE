'use client';

import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Upload, ArrowRight, Brain } from 'lucide-react';

export function SkinAnalysisSection() {
  const router = useRouter();
  const { isLoggedIn, user, openSignIn } = useAuthContext();

  const handleTryAnalysis = () => {
    if (!isLoggedIn || user?.role?.id !== 3) {
      openSignIn();
      return;
    }
    router.push('/patient/skin-analysis');
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium w-fit">
              <Brain className="w-4 h-4" />
              <span>Công nghệ AI tiên tiến</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Phân tích da bằng AI
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Sử dụng công nghệ trí tuệ nhân tạo để nhận diện và phân tích tình trạng da của bạn. 
              Chỉ cần chụp ảnh hoặc tải lên hình ảnh, hệ thống sẽ cung cấp đánh giá sơ bộ và khuyến nghị điều trị.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Chụp ảnh trực tiếp</h3>
                  <p className="text-sm text-muted-foreground">
                    Sử dụng camera để chụp ảnh vùng da cần phân tích
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Tải ảnh lên</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload hình ảnh từ thiết bị của bạn
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleTryAnalysis}
                className="bg-primary hover:bg-primary/90 text-primary-foreground group"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Thử ngay
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                size="lg"
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <Card className="overflow-hidden border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-shadow">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 p-8">
                  <div className="relative bg-background rounded-lg p-6 shadow-lg">
                    {/* Mock Analysis Display */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Phân tích AI</h4>
                          <p className="text-xs text-muted-foreground">Kết quả tức thì</p>
                        </div>
                      </div>

                      {/* Mock Image Placeholder */}
                      <div className="relative bg-muted rounded-lg aspect-square flex items-center justify-center border-2 border-dashed border-border">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-xs text-muted-foreground">Hình ảnh da</p>
                        </div>
                      </div>

                      {/* Mock Results */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Tình trạng:</span>
                          <span className="text-sm font-semibold text-foreground">Mụn trứng cá</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Độ tin cậy:</span>
                          <span className="text-sm font-semibold text-primary">85%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Mức độ:</span>
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            Trung bình
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

