'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, Loader2, AlertCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { useAuthContext } from '@/components/auth-provider';
import { ratingsAPI } from '@/services/api/ratings';
import { RatingByDoctorResponse, RatingListItem } from '@/types/rating';
import { doctorsApi } from '@/services/api/doctors';
import { Doctor } from '@/types/doctor';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function PatientRatingPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthContext();
  const { toast } = useToast();
  const [ratingsData, setRatingsData] = useState<RatingByDoctorResponse | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);

    if (!isLoggedIn || user?.role.id !== 2) {
      router.push('/');
      return;
    }

    fetchRatings();
  }, [isLoggedIn, user?.role?.id, router]);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Lấy doctor profile của user hiện tại
      const doctorProfile = await doctorsApi.getMyProfile();
      if (!doctorProfile || !doctorProfile.id) {
        setError('Không tìm thấy thông tin bác sĩ. Vui lòng tạo hồ sơ bác sĩ trước.');
        setIsLoading(false);
        return;
      }

      setDoctor(doctorProfile);

      // Lấy ratings theo doctor ID
      const data = await ratingsAPI.getByDoctor(doctorProfile.id);
      if (data) {
        setRatingsData(data);
      } else {
        setRatingsData({
          doctor_id: doctorProfile.id,
          doctor_name: `${doctorProfile.user?.first_name || ''} ${doctorProfile.user?.last_name || ''}`.trim() || 'Bác sĩ',
          statistics: {
            average_rating: 0,
            total_ratings: 0,
            rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          },
          ratings: [],
        });
      }
    } catch (err: any) {
      console.error('Error fetching ratings:', err);
      setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải đánh giá.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const ratings = ratingsData?.ratings || [];
  const statistics = ratingsData?.statistics;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground mb-1">Đánh Giá Của Bệnh Nhân</h1>
            <p className="text-muted-foreground text-sm">Xem tất cả đánh giá và nhận xét từ bệnh nhân</p>
          </div>

          {/* Statistics */}
          {statistics && statistics.total_ratings > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Điểm Trung Bình</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-2xl font-bold text-foreground">
                          {statistics.average_rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tổng Đánh Giá</p>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold text-foreground">
                          {statistics.total_ratings}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Phân Bố Đánh Giá</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = statistics.rating_distribution[star] || 0;
                      const percentage = statistics.total_ratings > 0 
                        ? (count / statistics.total_ratings) * 100 
                        : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-xs text-muted-foreground">{star}</span>
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          </div>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-6 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ratings List */}
          {ratings.length === 0 ? (
            <Card className="bg-background border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Chưa Có Đánh Giá</h3>
                <p className="text-muted-foreground text-sm">Đánh giá từ bệnh nhân sẽ hiển thị ở đây</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ratings.map((rating: RatingListItem) => (
                <Card key={rating.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 border">
                        <AvatarImage src={rating.patient_avatar || undefined} alt={rating.patient_name} />
                        <AvatarFallback className="bg-muted text-foreground font-medium">
                          {rating.patient_name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-foreground mb-1.5">{rating.patient_name}</h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {renderStars(rating.rating)}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {rating.rating}.0/5.0
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(rating.created_at), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        {rating.comment && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-foreground leading-relaxed">{rating.comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

