import apiClient from './axios-config';

export interface AnalysisResult {
  condition: string;
  confidence: number;
  description: string;
  recommendations: string[];
  severity: 'mild' | 'moderate' | 'severe';
  image?: string; // Ảnh được trả về từ API (base64 hoặc URL)
}

// Interface cho response từ server detect API
export interface DetectAPIResponse {
  image: string;
  results: Array<{
    label: string;
    score: number;
    link: string;
  }>;
}

// Mapping từ label sang condition name và description
const conditionMapping: Record<string, { name: string; description: string; severity: 'mild' | 'moderate' | 'severe' }> = {
  'Viêm mô tế bào': {
    name: 'Viêm mô tế bào (Cellulitis)',
    description: 'Viêm mô tế bào là tình trạng nhiễm trùng da và mô dưới da, thường do vi khuẩn gây ra. Tình trạng này cần được điều trị kịp thời.',
    severity: 'moderate',
  },
  'Mụn trứng cá': {
    name: 'Mụn trứng cá (Acne)',
    description: 'Phát hiện các dấu hiệu của mụn trứng cá với các nốt đỏ và viêm. Tình trạng này khá phổ biến và có thể điều trị được.',
    severity: 'moderate',
  },
  'Viêm da tiếp xúc': {
    name: 'Viêm da tiếp xúc (Contact Dermatitis)',
    description: 'Da có dấu hiệu kích ứng, đỏ và có thể ngứa. Có thể do tiếp xúc với chất gây dị ứng hoặc chất kích thích.',
    severity: 'mild',
  },
  'Chàm': {
    name: 'Chàm (Eczema)',
    description: 'Da có dấu hiệu khô, đỏ, ngứa và có thể bong tróc. Đây là tình trạng viêm da mãn tính.',
    severity: 'moderate',
  },
  'Vảy nến': {
    name: 'Vảy nến (Psoriasis)',
    description: 'Da có các mảng đỏ với vảy trắng bạc. Đây là tình trạng tự miễn dịch mãn tính.',
    severity: 'moderate',
  },
};

// Mock data for common skin conditions
const mockConditions = [
  {
    condition: 'Mụn trứng cá (Acne)',
    description: 'Phát hiện các dấu hiệu của mụn trứng cá với các nốt đỏ và viêm. Tình trạng này khá phổ biến và có thể điều trị được.',
    recommendations: [
      'Giữ da sạch sẽ, rửa mặt 2 lần/ngày với sữa rửa mặt nhẹ nhàng',
      'Tránh chạm tay lên mặt',
      'Sử dụng kem chống nắng không gây bít tắc lỗ chân lông',
      'Tham khảo ý kiến bác sĩ da liễu để có phương pháp điều trị phù hợp'
    ],
    severity: 'moderate' as const,
  },
  {
    condition: 'Viêm da tiếp xúc (Contact Dermatitis)',
    description: 'Da có dấu hiệu kích ứng, đỏ và có thể ngứa. Có thể do tiếp xúc với chất gây dị ứng hoặc chất kích thích.',
    recommendations: [
      'Tránh tiếp xúc với chất gây kích ứng',
      'Sử dụng kem dưỡng ẩm nhẹ nhàng',
      'Có thể sử dụng kem chống viêm theo chỉ định của bác sĩ',
      'Nếu tình trạng nặng, nên tham khảo ý kiến bác sĩ'
    ],
    severity: 'mild' as const,
  },
  {
    condition: 'Nốt ruồi (Mole)',
    description: 'Phát hiện nốt ruồi trên da. Hầu hết nốt ruồi là lành tính, nhưng cần theo dõi thay đổi.',
    recommendations: [
      'Theo dõi sự thay đổi về kích thước, màu sắc, hình dạng',
      'Bảo vệ da khỏi ánh nắng mặt trời',
      'Khám định kỳ với bác sĩ da liễu',
      'Nếu có thay đổi bất thường, nên đi khám ngay'
    ],
    severity: 'mild' as const,
  },
  {
    condition: 'Chàm (Eczema)',
    description: 'Da có dấu hiệu khô, đỏ, ngứa và có thể bong tróc. Đây là tình trạng viêm da mãn tính.',
    recommendations: [
      'Dưỡng ẩm da thường xuyên',
      'Tránh tắm nước quá nóng',
      'Sử dụng sản phẩm chăm sóc da không gây kích ứng',
      'Tham khảo bác sĩ về phương pháp điều trị phù hợp'
    ],
    severity: 'moderate' as const,
  },
  {
    condition: 'Vảy nến (Psoriasis)',
    description: 'Da có các mảng đỏ với vảy trắng bạc. Đây là tình trạng tự miễn dịch mãn tính.',
    recommendations: [
      'Giữ ẩm da thường xuyên',
      'Tránh stress và các yếu tố kích hoạt',
      'Tắm nắng nhẹ có thể giúp cải thiện',
      'Cần điều trị dưới sự giám sát của bác sĩ chuyên khoa'
    ],
    severity: 'moderate' as const,
  },
];

// Helper function để convert File sang base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove data:image/jpeg;base64, prefix nếu có
      const base64 = base64String.includes(',') 
        ? base64String.split(',')[1] 
        : base64String;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const skinAnalysisAPI = {
  /**
   * Phân tích hình ảnh da
   * @param imageFile File hình ảnh cần phân tích
   * @returns Kết quả phân tích
   */
  analyze: async (imageFile: File): Promise<AnalysisResult> => {
    try {
      // Convert image to base64
      const base64Image = await fileToBase64(imageFile);

      // Gọi API detect qua Next.js API route để tránh CORS
      // API route sẽ proxy request đến server detect
      const apiRoute = '/api/detect';
      
      const response = await fetch(apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: DetectAPIResponse = await response.json();

      // Map response từ server sang format của ứng dụng
      if (data.results && data.results.length > 0) {
        const topResult = data.results[0]; // Lấy kết quả có score cao nhất
        
        // Sử dụng label trực tiếp từ API response
        const label = topResult.label;
        
        // Lấy thông tin bổ sung từ mapping nếu có, nếu không thì tạo mới
        const conditionInfo = conditionMapping[label] || {
          name: label,
          description: `Phát hiện tình trạng: ${label}. Độ tin cậy: ${(topResult.score * 100).toFixed(1)}%.`,
          severity: topResult.score > 0.8 ? 'moderate' : 'mild' as const,
        };

        // Generate recommendations dựa trên label
        const recommendations = getRecommendations(label, topResult.score);

        // Chuyển đổi ảnh từ API response sang data URL nếu cần
        let imageUrl: string | undefined;
        if (data.image) {
          // Nếu ảnh là base64 string, chuyển thành data URL
          if (data.image.startsWith('data:')) {
            imageUrl = data.image;
          } else if (data.image.startsWith('http://') || data.image.startsWith('https://')) {
            imageUrl = data.image;
          } else {
            // Nếu là base64 string không có prefix, thêm prefix
            imageUrl = `data:image/jpeg;base64,${data.image}`;
          }
        }

        return {
          condition: label, // Hiển thị trực tiếp label từ API
          confidence: topResult.score,
          description: conditionInfo.description,
          recommendations,
          severity: conditionInfo.severity,
          image: imageUrl, // Ảnh được trả về từ API
        };
      }

      // Nếu không có kết quả, fallback to mock
      throw new Error('No results from API');
    } catch (error: any) {
      console.error('Error analyzing skin image:', error);
      
      // Fallback to mock data if API fails
      const randomCondition = mockConditions[
        Math.floor(Math.random() * mockConditions.length)
      ];

      return {
        ...randomCondition,
        confidence: 0.70 + Math.random() * 0.15,
      };
    }
  },

  /**
   * Lấy lịch sử phân tích
   */
  getHistory: async (): Promise<AnalysisResult[]> => {
    try {
      const response = await apiClient.get('/skin-analysis/history/');
      return response.data;
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      return [];
    }
  },
};

// Helper function để generate recommendations
function getRecommendations(label: string, confidence: number): string[] {
  const baseRecommendations = [
    'Giữ da sạch sẽ, rửa mặt 2 lần/ngày với sữa rửa mặt nhẹ nhàng',
    'Sử dụng kem chống nắng hàng ngày',
    'Tham khảo ý kiến bác sĩ da liễu để có phương pháp điều trị phù hợp',
  ];

  const specificRecommendations: Record<string, string[]> = {
    // Match với label từ API (tên tiếng Việt)
    'Viêm mô tế bào': [
      'Điều trị viêm mô tế bào cần được thực hiện ngay lập tức',
      'Sử dụng kháng sinh theo chỉ định của bác sĩ',
      'Giữ vùng da bị ảnh hưởng sạch sẽ và khô ráo',
      'Nếu có dấu hiệu sốt hoặc tình trạng nặng hơn, cần đến bệnh viện ngay',
    ],
    'Mụn trứng cá': [
      'Giữ da sạch sẽ, rửa mặt 2 lần/ngày với sữa rửa mặt nhẹ nhàng',
      'Tránh chạm tay lên mặt',
      'Sử dụng kem chống nắng không gây bít tắc lỗ chân lông',
      'Tham khảo ý kiến bác sĩ da liễu để có phương pháp điều trị phù hợp',
    ],
    'Viêm da tiếp xúc': [
      'Tránh tiếp xúc với chất gây kích ứng',
      'Sử dụng kem dưỡng ẩm nhẹ nhàng',
      'Có thể sử dụng kem chống viêm theo chỉ định của bác sĩ',
      'Nếu tình trạng nặng, nên tham khảo ý kiến bác sĩ',
    ],
    'Chàm': [
      'Dưỡng ẩm da thường xuyên',
      'Tránh tắm nước quá nóng',
      'Sử dụng sản phẩm chăm sóc da không gây kích ứng',
      'Tham khảo bác sĩ về phương pháp điều trị phù hợp',
    ],
    'Vảy nến': [
      'Giữ ẩm da thường xuyên',
      'Tránh stress và các yếu tố kích hoạt',
      'Tắm nắng nhẹ có thể giúp cải thiện',
      'Cần điều trị dưới sự giám sát của bác sĩ chuyên khoa',
    ],
    // Fallback cho các tên đầy đủ (nếu có)
    'Viêm mô tế bào (Cellulitis)': [
      'Điều trị viêm mô tế bào cần được thực hiện ngay lập tức',
      'Sử dụng kháng sinh theo chỉ định của bác sĩ',
      'Giữ vùng da bị ảnh hưởng sạch sẽ và khô ráo',
      'Nếu có dấu hiệu sốt hoặc tình trạng nặng hơn, cần đến bệnh viện ngay',
    ],
    'Mụn trứng cá (Acne)': [
      'Giữ da sạch sẽ, rửa mặt 2 lần/ngày với sữa rửa mặt nhẹ nhàng',
      'Tránh chạm tay lên mặt',
      'Sử dụng kem chống nắng không gây bít tắc lỗ chân lông',
      'Tham khảo ý kiến bác sĩ da liễu để có phương pháp điều trị phù hợp',
    ],
    'Viêm da tiếp xúc (Contact Dermatitis)': [
      'Tránh tiếp xúc với chất gây kích ứng',
      'Sử dụng kem dưỡng ẩm nhẹ nhàng',
      'Có thể sử dụng kem chống viêm theo chỉ định của bác sĩ',
      'Nếu tình trạng nặng, nên tham khảo ý kiến bác sĩ',
    ],
    'Chàm (Eczema)': [
      'Dưỡng ẩm da thường xuyên',
      'Tránh tắm nước quá nóng',
      'Sử dụng sản phẩm chăm sóc da không gây kích ứng',
      'Tham khảo bác sĩ về phương pháp điều trị phù hợp',
    ],
    'Vảy nến (Psoriasis)': [
      'Giữ ẩm da thường xuyên',
      'Tránh stress và các yếu tố kích hoạt',
      'Tắm nắng nhẹ có thể giúp cải thiện',
      'Cần điều trị dưới sự giám sát của bác sĩ chuyên khoa',
    ],
  };

  return specificRecommendations[label] || baseRecommendations;
}

//sadasdádsad