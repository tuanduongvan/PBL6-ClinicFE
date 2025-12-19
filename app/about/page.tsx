'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Award, Users, Target } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Chăm sóc tận tâm',
    description: 'Chúng tôi đặt sức khỏe và hạnh phúc của bệnh nhân lên hàng đầu trong mọi quyết định.',
  },
  {
    icon: Award,
    title: 'Chuyên nghiệp',
    description: 'Đội ngũ bác sĩ giàu kinh nghiệm và được đào tạo chuyên sâu về da liễu.',
  },
  {
    icon: Users,
    title: 'Hướng đến bệnh nhân',
    description: 'Mỗi bệnh nhân đều nhận được sự chăm sóc cá nhân hóa và tư vấn chi tiết.',
  },
  {
    icon: Target,
    title: 'Đổi mới liên tục',
    description: 'Áp dụng các công nghệ và phương pháp điều trị mới nhất trong da liễu.',
  },
];

export default function AboutPage() {
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();

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
                Về chúng tôi
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Phòng khám da liễu chuyên nghiệp với đội ngũ bác sĩ giàu kinh nghiệm, 
                cam kết mang đến dịch vụ chăm sóc da tốt nhất cho bạn
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Sứ mệnh của chúng tôi
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Chúng tôi cam kết cung cấp dịch vụ chăm sóc da liễu chất lượng cao, 
                sử dụng các phương pháp điều trị tiên tiến và công nghệ hiện đại. 
                Mục tiêu của chúng tôi là giúp mọi người có được làn da khỏe mạnh và tự tin.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Với đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm và tận tâm, 
                chúng tôi luôn đặt bệnh nhân làm trung tâm trong mọi quyết định điều trị.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-2xl"></div>
              <img
                src="/professional-dermatology-clinic.jpg"
                alt="Derma Clinic"
                className="relative w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-secondary/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Giá trị cốt lõi
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Những nguyên tắc định hướng mọi hoạt động của chúng tôi
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Bệnh nhân hài lòng</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-muted-foreground">Bác sĩ chuyên khoa</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10+</div>
              <div className="text-muted-foreground">Năm kinh nghiệm</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
              <div className="text-muted-foreground">Đánh giá trung bình</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

