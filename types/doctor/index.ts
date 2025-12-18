import { User } from '@/types/auth';

/**
 * Kiểu Doctor dùng chung cho dữ liệu trả về từ API backend (/api/doctors/)
 * và dữ liệu mock trên frontend.
 *
 * - Khi dữ liệu đến từ backend: thông tin user sẽ nằm trong trường `user`.
 * - Khi dữ liệu là mock: có thể là dạng phẳng, khi đó component hiển thị sẽ fallback.
 */
export interface Doctor {
  id: number;

  // Dữ liệu từ backend: /api/doctors/
  user?: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    avatar: string | null;
    role: number;
    date_joined: string;
    is_active: boolean;
  };

  // Một số component cũ/mocked có thể treat Doctor như User phẳng
  // nên giữ lại các field này ở dạng optional để không gây lỗi.
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;

  // Thông tin chuyên khoa, phòng, giá, kinh nghiệm...
  specialty?: number | null;
  room?: number | null;
  price?: number;
  experience?: number | null;
  credentiaUrl?: string | null;
  verificationStatus?: string;
  is_available?: boolean;
  created_at?: string;
  description?: string | null;

  // Thông tin bổ sung chỉ dùng cho UI
  specialization?: string;
  rating?: number;
  patients?: number;
}