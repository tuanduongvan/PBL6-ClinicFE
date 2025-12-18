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

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor;
  onSuccess?: (ratingData: { rating: number; comment: string }) => void;
}

export function RatingModal({ 
  isOpen, 
  onClose,
  doctor,
  onSuccess 
}: RatingModalProps) {
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

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const ratingData = {
        rating,
        comment: comment.trim(),
      };

      onSuccess?.(ratingData);
      onClose();
      setRating(0);
      setComment('');
      setHoverRating(0);
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
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

