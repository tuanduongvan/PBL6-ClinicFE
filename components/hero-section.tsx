"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

interface HeroSectionProps {
  onBooking?: () => void
  isLoggedIn?: boolean
}

export function HeroSection({ onBooking, isLoggedIn }: HeroSectionProps) {
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    setIsAnimated(true)
  }, [])

  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-primary/5 via-background to-secondary/10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl transition-all duration-1000 ${isAnimated ? "opacity-100" : "opacity-0"}`}
        ></div>
        <div
          className={`absolute -bottom-20 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl transition-all duration-1000 delay-200 ${isAnimated ? "translate-y-0" : "translate-y-32"}`}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            className={`space-y-6 transition-all duration-1000 ${isAnimated ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <div className="inline-block">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium animate-fade-in">
                Chăm sóc da liễu chuyên nghiệp
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance animate-slide-up">
              Làn da khỏe mạnh bắt đầu từ đây
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl text-balance animate-fade-in delay-200">
              Đội ngũ bác sĩ da liễu chuyên nghiệp cung cấp giải pháp chăm sóc da cá nhân hóa. 
              Đặt lịch hẹn với các bác sĩ được đánh giá cao của chúng tôi ngay hôm nay.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={onBooking} className="bg-primary hover:bg-primary/90 text-primary-foreground group text-base px-8 py-6 h-auto">
                Đặt lịch hẹn ngay
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 bg-transparent text-base px-8 py-6 h-auto"
                onClick={() => {
                  document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Tìm hiểu thêm
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="animate-fade-in delay-300">
                <div className="text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Bệnh nhân hài lòng</div>
              </div>
              <div className="animate-fade-in delay-400">
                <div className="text-3xl font-bold text-primary mb-1">15+</div>
                <div className="text-sm text-muted-foreground">Bác sĩ chuyên khoa</div>
              </div>
              <div className="animate-fade-in delay-500">
                <div className="text-3xl font-bold text-primary mb-1">4.8★</div>
                <div className="text-sm text-muted-foreground">Đánh giá trung bình</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div
            className={`relative transition-all duration-1000 ${isAnimated ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-2xl"></div>
              <img
                src="/professional-dermatology-clinic.jpg"
                alt="Derma Clinic"
                className="relative w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
