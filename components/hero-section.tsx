"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Award, Users, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  onBooking?: () => void
  isLoggedIn?: boolean
}

const stats = [
  { value: "500+", label: "Bệnh nhân hài lòng", icon: Users },
  { value: "15+", label: "Bác sĩ chuyên khoa", icon: Award },
  { value: "4.8", label: "Đánh giá trung bình", icon: Star },
] as const

export function HeroSection({ onBooking, isLoggedIn }: HeroSectionProps) {
  const handleScrollToServices = () => {
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-1" />
        <div className="absolute bottom-1/4 left-1/4 w-[32rem] h-[32rem] bg-accent/3 rounded-full blur-3xl animate-float-2" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>Chăm sóc da liễu chuyên nghiệp</span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
                Làn da khỏe mạnh{" "}
                <span className="text-primary relative">
                  bắt đầu từ đây
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full" />
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Đội ngũ bác sĩ da liễu chuyên nghiệp cung cấp giải pháp chăm sóc da cá nhân hóa. 
                Đặt lịch hẹn với các bác sĩ được đánh giá cao của chúng tôi ngay hôm nay.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                onClick={onBooking} 
                size="lg"
                className="group text-base sm:text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Đặt lịch hẹn ngay
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleScrollToServices}
                className="text-base sm:text-lg px-8 py-6 h-auto rounded-xl border-2 hover:bg-primary/5 transition-all duration-300"
              >
                Tìm hiểu thêm
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-8 border-t border-border/50">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div 
                    key={stat.value} 
                    className={cn(
                      "space-y-2 animate-fade-in",
                      index === 0 && "delay-300",
                      index === 1 && "delay-400",
                      index === 2 && "delay-500"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <div className="text-2xl sm:text-3xl font-bold text-foreground">
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground leading-tight">
                      {stat.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-fade-in delay-200">
            <div className="relative aspect-[4/3] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 z-10" />
              
              {/* Image */}
              <Image
                src="/professional-dermatology-clinic.jpg"
                alt="Professional dermatology clinic with modern facilities"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-2xl blur-xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-2xl blur-xl -z-10" />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:-right-6 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg p-4 animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Chứng nhận</div>
                  <div className="text-xs text-muted-foreground">Chuyên khoa da liễu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
