'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Stethoscope, 
  MapPin, 
  Clock, 
  DollarSign, 
  Award, 
  Mail, 
  Phone, 
  Calendar,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  FileText,
  Star,
  Users,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { doctorsApi } from '@/services/api/doctors'
import { specialitiesAPI } from '@/services/api/specialities'
import { BookingAppointmentModal } from '@/components/modals/booking-appointment-modal'
import { useAuthContext } from '@/components/auth-provider'
import type { Doctor } from '@/types/doctor'
import type { Speciality } from '@/services/api/specialities'

export default function DoctorPortfolioPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoggedIn, openSignIn } = useAuthContext()
  const doctorId = params.id as string

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [specialty, setSpecialty] = useState<Speciality | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!doctorId) return

      setIsLoading(true)
      setError('')

      try {
        const [doctorData, allSpecialities] = await Promise.all([
          doctorsApi.getById(doctorId),
          specialitiesAPI.getAll()
        ])

        if (!doctorData) {
          setError('Không tìm thấy thông tin bác sĩ.')
          setIsLoading(false)
          return
        }

        setDoctor(doctorData)

        // Tìm specialty name từ ID
        if (doctorData.specialty) {
          const foundSpecialty = allSpecialities.find(s => s.id === doctorData.specialty)
          if (foundSpecialty) {
            setSpecialty(foundSpecialty)
          }
        }
      } catch (err: any) {
        console.error('Error fetching doctor:', err)
        setError('Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctorData()
  }, [doctorId])

  const handleBookAppointment = () => {
    if (!isLoggedIn) {
      openSignIn()
      return
    }

    if (user?.role.id === 2) {
      router.push('/doctor/dashboard')
      return
    }

    if (user?.role.id === 3 && doctor) {
      setIsBookingOpen(true)
    }
  }

  const handleBookingSuccess = () => {
    setIsBookingOpen(false)
  }

  const handleBookingClose = () => {
    setIsBookingOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header 
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={() => {}}
          onSignIn={openSignIn}
          onSignUp={() => {}}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải thông tin bác sĩ...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header 
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={() => {}}
          onSignIn={openSignIn}
          onSignUp={() => {}}
        />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Lỗi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error || 'Không tìm thấy thông tin bác sĩ.'}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push('/doctors')} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại danh sách
                </Button>
                <Button onClick={() => router.push('/')} className="flex-1">
                  Về trang chủ
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const userInfo = doctor.user || {
    first_name: doctor.first_name || doctor.firstName || '',
    last_name: doctor.last_name || doctor.lastName || '',
    username: doctor.username || 'Bác sĩ',
    avatar: doctor.avatar || null,
    email: '',
    phone: doctor.phone || '',
    role: 2,
    date_joined: '',
    is_active: true,
  }

  const fullName = `${userInfo.first_name} ${userInfo.last_name}`.trim() || userInfo.username
  const avatarSrc = userInfo.avatar && userInfo.avatar !== '' ? userInfo.avatar : '/placeholder-user.jpg'
  const specialtyName = doctor.specialization || specialty?.name || `Chuyên khoa #${doctor.specialty || 'Tổng quát'}`

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={() => {}}
        onSignIn={openSignIn}
        onSignUp={() => {}}
      />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Trang chủ
              </Link>
              <span>/</span>
              <Link href="/doctors" className="hover:text-foreground transition-colors">
                Danh sách bác sĩ
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">{fullName}</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={avatarSrc}
                    alt={fullName}
                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-background shadow-lg"
                  />
                  {doctor.is_available && (
                    <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Clock className="w-3 h-3" />
                      <span>Sẵn sàng</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    BS. {fullName}
                  </h1>
                  <div className="flex items-center gap-2 text-primary font-medium mb-4">
                    <Stethoscope className="w-5 h-5" />
                    <span className="text-lg">{specialtyName}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                  {doctor.experience !== null && doctor.experience !== undefined && (
                    <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg shadow-sm">
                      <Award className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold text-foreground">{doctor.experience} năm</div>
                        <div className="text-xs text-muted-foreground">Kinh nghiệm</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg shadow-sm">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">
                        {doctor.price?.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-xs text-muted-foreground">Giá khám</div>
                    </div>
                  </div>

                  {doctor.room && (
                    <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg shadow-sm">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold text-foreground">Phòng {doctor.room}</div>
                        <div className="text-xs text-muted-foreground">Nơi làm việc</div>
                      </div>
                    </div>
                  )}

                  {doctor.rating && (
                    <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg shadow-sm">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <div>
                        <div className="font-semibold text-foreground">
                          {doctor.rating.toFixed(1)} ({doctor.patients || 0})
                        </div>
                        <div className="text-xs text-muted-foreground">Đánh giá</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button 
                    size="lg" 
                    onClick={handleBookAppointment}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Đặt Lịch Khám
                  </Button>
                  {user?.role.id === 3 && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => router.push(`/patient/booking/${doctor.id}`)}
                    >
                      Xem Lịch Trình
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    Giới Thiệu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {doctor.description ? (
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {doctor.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Bác sĩ chưa cập nhật thông tin giới thiệu.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Credentials Section */}
              {doctor.credentiaUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Chứng Chỉ & Bằng Cấp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={doctor.credentiaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Xem chứng chỉ y khoa
                    </a>
                  </CardContent>
                </Card>
              )}

              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Trạng Thái Xác Minh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {doctor.verificationStatus === 'VERIFIED' ? (
                      <>
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Đã xác minh
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Bác sĩ đã được xác minh và có thể nhận bệnh nhân
                        </span>
                      </>
                    ) : doctor.verificationStatus === 'PENDING' ? (
                      <>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Đang chờ xét duyệt
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Hồ sơ đang được xem xét
                        </span>
                      </>
                    ) : (
                      <>
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Chưa xác minh
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Hồ sơ chưa được xác minh
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông Tin Liên Hệ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userInfo.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Số điện thoại</div>
                        <a 
                          href={`tel:${userInfo.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {userInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {userInfo.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Email</div>
                        <a 
                          href={`mailto:${userInfo.email}`}
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {userInfo.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {doctor.room && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Phòng khám</div>
                        <div className="text-sm text-muted-foreground">Phòng {doctor.room}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Specialty Info */}
              {specialty && (
                <Card>
                  <CardHeader>
                    <CardTitle>Chuyên Khoa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">{specialty.name}</h3>
                      {specialty.description && (
                        <p className="text-sm text-muted-foreground">{specialty.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Thao Tác Nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={handleBookAppointment}
                    size="lg"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Đặt Lịch Khám
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/doctors')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Xem Bác Sĩ Khác
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <BookingAppointmentModal
        isOpen={isBookingOpen}
        onClose={handleBookingClose}
        doctor={doctor}
        onSuccess={handleBookingSuccess}
      />

      <Footer />
    </div>
  )
}

