'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface Rating {
  id: string;
  patientName: string;
  patientAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

const mockRatings: Rating[] = [
  {
    id: '1',
    patientName: 'John Doe',
    rating: 5,
    comment: 'Excellent doctor! Very professional and caring. Helped me with my skin condition.',
    date: '2024-01-15',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    rating: 4,
    comment: 'Great experience overall. The doctor was knowledgeable and explained everything clearly.',
    date: '2024-01-10',
  },
  {
    id: '3',
    patientName: 'Mike Johnson',
    rating: 5,
    comment: 'Highly recommend! The treatment was effective and the doctor was very attentive.',
    date: '2024-01-05',
  },
];

export default function PatientRatingPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load patient ratings
    setRatings(mockRatings);
  }, []);

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Patient Ratings</h1>
            <p className="text-gray-600 text-sm">View all patient reviews and ratings</p>
          </div>

          {ratings.length === 0 ? (
            <Card className="bg-white border-dashed border-gray-300 shadow-sm">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Ratings Yet</h3>
                <p className="text-gray-600 text-sm">Patient ratings will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ratings.map((rating) => (
                <Card key={rating.id} className="bg-white hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 border border-gray-200">
                        <AvatarImage src={rating.patientAvatar} alt={rating.patientName} />
                        <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                          {rating.patientName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1.5">{rating.patientName}</h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {renderStars(rating.rating)}
                              </div>
                              <span className="text-sm text-gray-600">
                                {rating.rating}.0/5.0
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(rating.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-700 leading-relaxed">{rating.comment}</p>
                        </div>
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

