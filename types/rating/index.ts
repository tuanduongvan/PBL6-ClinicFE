export interface Rating {
  id: number;
  appointment: number;
  doctor: {
    id: number;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      avatar?: string | null;
    };
  };
  patient: {
    id: number;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      avatar?: string | null;
    };
  };
  rating: number; // 1-5
  comment?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RatingListItem {
  id: number;
  rating: number;
  comment?: string | null;
  patient_name: string;
  patient_avatar?: string | null;
  created_at: string;
}

export interface RatingStatistics {
  average_rating: number;
  total_ratings: number;
  rating_distribution: {
    [key: number]: number; // 1-5
  };
}

export interface RatingByDoctorResponse {
  doctor_id: number;
  doctor_name: string;
  statistics: RatingStatistics;
  ratings: RatingListItem[];
}

