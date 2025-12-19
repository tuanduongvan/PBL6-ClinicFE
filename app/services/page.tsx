'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap, Heart, Shield, CheckCircle2 } from 'lucide-react';

export default function ServicesPage() {
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();

  const services = [
    {
      icon: Heart,
      title: 'Điều trị mụn',
      description: 'Giải pháp điều trị mụn tiên tiến cho mọi loại da và tình trạng mụn.',
      features: [
        'Điều trị mụn viêm và không viêm',
        'Chăm sóc da sau điều trị',
        'Tư vấn chế độ ăn uống phù hợp',
        'Theo dõi tiến trình điều trị',
      ],
    },
    {
      icon: Sparkles,
      title: 'Chống lão hóa',
      description: 'Điều trị trẻ hóa và chống lão hóa với kết quả đã được chứng minh.',
      features: [
        'Điều trị nếp nhăn',
        'Làm đầy da',
        'Cải thiện độ đàn hồi',
        'Chăm sóc da chuyên sâu',
      ],
    },
    {
      icon: Zap,
      title: 'Phẫu thuật da',
      description: 'Các thủ thuật phẫu thuật da chuyên nghiệp như cắt bỏ nốt ruồi.',
      features: [
        'Cắt bỏ nốt ruồi an toàn',
        'Phẫu thuật da liễu',
        'Xử lý sẹo',
        'Chăm sóc sau phẫu thuật',
      ],
    },
    {
      icon: Shield,
      title: 'Chăm sóc phòng ngừa',
      description: 'Bảo trì sức khỏe da toàn diện và các chiến lược phòng ngừa.',
      features: [
        'Khám da định kỳ',
        'Tư vấn bảo vệ da',
        'Sàng lọc ung thư da',
        'Chăm sóc da hàng ngày',
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={logout}
        onSignIn={openSignIn}
        onSignUp={openSignUp}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                Dịch vụ của chúng tôi
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Dịch vụ da liễu toàn diện được thiết kế phù hợp với nhu cầu da của bạn
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl text-foreground mb-2">
                          {service.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {service.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-secondary/30 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Đặt lịch hẹn với bác sĩ của chúng tôi ngay hôm nay để nhận được tư vấn chuyên nghiệp
            </p>
            {isLoggedIn ? (
              <a
                href="/doctors"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Đặt lịch hẹn
              </a>
            ) : (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={openSignUp}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Đăng ký ngay
                </button>
                <button
                  onClick={openSignIn}
                  className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
                >
                  Đăng nhập
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

