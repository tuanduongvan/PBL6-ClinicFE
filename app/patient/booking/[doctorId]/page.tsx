"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookingAppointmentModal } from "@/components/modals/booking-appointment-modal"
import { useAuthContext } from "@/components/auth-provider"
import type { Doctor } from "@/types/doctor"
import { doctorsApi } from "@/services/api/doctors" // Import đúng tên doctorsApi
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, MapPin, Stethoscope } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const doctorId = params.doctorId as string

  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(true)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/")
      return
    }

    const fetchDoctor = async () => {
      try {
        setIsLoading(true)
        // Gọi API lấy chi tiết bác sĩ
        const data = await doctorsApi.getById(doctorId)
        setDoctor(data)
      } catch (error) {
        console.error("Failed to load doctor", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (doctorId) {
      fetchDoctor()
    }
  }, [isLoggedIn, doctorId, router])

  const handleBookingSuccess = async (appointmentData: any) => {
    setBookingSuccess(true)
    setTimeout(() => {
      router.push("/patient/my-appointments")
    }, 2000)
  }

  const handleBookingClose = () => {
    setIsBookingOpen(false)
    router.back() // Quay lại trang trước đó thay vì về home
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} onSignIn={openSignIn} onSignUp={openSignUp} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {bookingSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Đặt lịch thành công! Đang chuyển hướng đến danh sách lịch hẹn...
            </AlertDescription>
          </Alert>
        )}

        {doctor ? (
          <Card className="mb-6 overflow-hidden border-none shadow-lg">
            <CardContent className="p-0">
              <div className="bg-primary/5 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="relative">
                    <img
                      src={doctor.user.avatar || "/placeholder-user.jpg"}
                      alt={`Dr. ${doctor.user.first_name}`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-md"
                    />
                    <Badge className="absolute -bottom-2 -right-2 px-3 py-1 bg-green-500 hover:bg-green-600">
                      {doctor.is_available ? "Đang làm việc" : "Tạm nghỉ"}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      BS. {doctor.user.first_name} {doctor.user.last_name}
                    </h1>
                    
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Stethoscope className="w-4 h-4" />
                      {/* Xử lý hiển thị chuyên khoa nếu specialty là ID hoặc Object */}
                      <span>
                        Chuyên khoa: {typeof doctor.specialty === 'object' && doctor.specialty ? (doctor.specialty as any).name : `Khoa ${doctor.specialty || 'Tổng quát'}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 bg-background px-3 py-1.5 rounded-full shadow-sm">
                        <span className="font-semibold text-foreground">{doctor.experience || 0} Năm</span>
                        <span>Kinh nghiệm</span>
                      </div>
                      <div className="flex items-center gap-1 bg-background px-3 py-1.5 rounded-full shadow-sm">
                        <span className="font-semibold text-foreground">
                          {doctor.price?.toLocaleString()} đ
                        </span>
                        <span>Giá khám</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                <h3 className="text-lg font-semibold mb-3">Giới thiệu</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {doctor.description || "Bác sĩ chưa cập nhật thông tin giới thiệu."}
                </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {doctor.rating || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Đánh giá</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {doctor.patients || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Bệnh nhân</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {doctor.experience || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Năm kinh nghiệm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {doctor.is_available ? 'Có' : 'Không'}
                    </div>
                    <div className="text-xs text-muted-foreground">Sẵn sàng</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Không tìm thấy thông tin bác sĩ.</p>
            </CardContent>
          </Card>
        )}
      </main>

      <BookingAppointmentModal
        isOpen={isBookingOpen && !!doctor}
        onClose={handleBookingClose}
        doctor={doctor || undefined}
        onSuccess={handleBookingSuccess}
      />

      <Footer />
    </div>
  )
}