'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2, Star } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Doctor } from '@/types/doctor';
import { Appointment } from '@/types/appointment';
import { ratingsAPI } from '@/services/api/ratings';
import { useToast } from '@/hooks/use-toast';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor;
  appointment?: Appointment;
  onSuccess?: () => void;
}

export function RatingModal({ 
  isOpen, 
  onClose,
  doctor,
  appointment,
  onSuccess 
}: RatingModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleStarClick = (value: number) => {
    setRating(value);
    setError('');
  };

  const handleStarHover = (value: number) => {
    setHoverRating(value);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Vui lòng chọn đánh giá');
      return;
    }

    if (!appointment) {
      setError('Không tìm thấy thông tin lịch hẹn');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if appointment already has rating before submitting
      const existingRating = await ratingsAPI.getByAppointment(appointment.id);
      if (existingRating) {
        setError('Lịch hẹn này đã được đánh giá.');
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Lịch hẹn này đã được đánh giá.',
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        appointment_id: appointment.id,
        rating,
        comment: comment.trim() || undefined,
      };
      
      console.log('Creating rating with payload:', payload);
      
      await ratingsAPI.create(payload);

      toast({
        title: 'Thành công',
        description: 'Đánh giá của bạn đã được gửi thành công.',
      });

      onSuccess?.();
      onClose();
      setRating(0);
      setComment('');
      setHoverRating(0);
    } catch (err: any) {
      console.error('Error creating rating:', err);
      console.error('Error response:', err.response?.data);
      
      // Extract error message from various possible locations
      let errorMessage = 'Không thể gửi đánh giá. Vui lòng thử lại.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for field-specific errors
        if (errorData.appointment_id) {
          errorMessage = Array.isArray(errorData.appointment_id) 
            ? errorData.appointment_id[0] 
            : errorData.appointment_id;
        } else if (errorData.appointment) {
          errorMessage = Array.isArray(errorData.appointment) 
            ? errorData.appointment[0] 
            : errorData.appointment;
        } else if (errorData.rating) {
          errorMessage = Array.isArray(errorData.rating) 
            ? errorData.rating[0] 
            : errorData.rating;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          // Try to get first error message from object
          const firstKey = Object.keys(errorData)[0];
          if (firstKey) {
            const firstError = errorData[firstKey];
            errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          }
        }
      }
      
      setError(errorMessage);
      
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setRating(0);
      setComment('');
      setHoverRating(0);
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Đánh giá Bác sĩ</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn với {doctor 
              ? `BS. ${doctor.user?.first_name || doctor.first_name || ''} ${doctor.user?.last_name || doctor.last_name || ''}`
              : 'bác sĩ này'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Doctor Info */}
          {doctor && (
            <div className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
              <img 
                src={doctor.user?.avatar || doctor.avatar || "/placeholder.svg"} 
                alt={doctor.user?.first_name || doctor.first_name || 'Doctor'}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-foreground">
                  BS. {doctor.user?.first_name || doctor.first_name || ''} {doctor.user?.last_name || doctor.last_name || ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  {doctor.specialization || doctor.specialty?.name || 'Bác sĩ'}
                </p>
              </div>
            </div>
          )}

          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Đánh giá *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleStarClick(value)}
                  onMouseEnter={() => handleStarHover(value)}
                  onMouseLeave={handleStarLeave}
                  disabled={isLoading}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      value <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}.0 / 5.0
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Nhận xét (Tùy chọn)</Label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ trải nghiệm của bạn với bác sĩ..."
              value={comment}
              onChange={handleCommentChange}
              disabled={isLoading}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading || rating === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi đánh giá'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

