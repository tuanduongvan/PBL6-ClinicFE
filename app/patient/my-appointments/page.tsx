"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthContext } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RatingModal } from "@/components/modals/rating-modal"
import { BookingAppointmentModal } from "@/components/modals/booking-appointment-modal"
import { RescheduleAppointmentModal } from "@/components/modals/reschedule-appointment-modal"
import { appointmentsAPI } from "@/services/api/appointments"
import { notificationsAPI, Notification } from "@/services/api/notifications"
import { useToast } from "@/hooks/use-toast"
import { Appointment } from "@/types/appointment"
import { Doctor } from "@/types/doctor"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2, Star, XCircle, User } from "lucide-react"

const NOTIFICATION_POLL_INTERVAL = 5000; // 5 seconds

export default function MyAppointmentsPage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext()
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null)
  const [cancelingId, setCancelingId] = useState<number | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null)
  const readNotificationIds = useRef<Set<number>>(new Set())
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await appointmentsAPI.getMyAppointments()
      setAppointments(data)
    } catch (err: any) {
      console.error('Error fetching appointments:', err)
      setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại.')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách lịch hẹn.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkNotifications = async () => {
    // Don't check notifications if user is not logged in
    if (!isLoggedIn) {
      return
    }
    
    try {
      const notifications = await notificationsAPI.getMyNotifications()
      const unreadNotifications = notifications.filter(
        n => !n.is_read && !readNotificationIds.current.has(n.id)
      )

      for (const notification of unreadNotifications) {
        readNotificationIds.current.add(notification.id)
        
        // Show toast based on notification type
        if (notification.type === 'appointment_confirmed') {
          toast({
            title: 'Thành công',
            description: notification.message || 'Lịch hẹn của bạn đã được bác sĩ xác nhận.',
          })
          // Refresh appointments
          await fetchAppointments()
        } else if (notification.type === 'appointment_rejected') {
          toast({
            variant: 'destructive',
            title: 'Thông báo',
            description: notification.message || 'Lịch hẹn của bạn không được chấp nhận, vui lòng chọn ca khác.',
          })
          // Refresh appointments
          await fetchAppointments()
        } else {
          // Other notification types
          toast({
            title: 'Thông báo',
            description: notification.message,
          })
        }

        // Mark as read
        await notificationsAPI.markAsRead(notification.id)
      }
    } catch (error: any) {
      // Ignore aborted requests
      if (error?.code === 'ERR_CANCELED' || error?.message === 'Request aborted' || error?.name === 'AbortError') {
        return
      }
      console.error('Error checking notifications:', error)
    }
  }

  useEffect(() => {
    setIsMounted(true)

    if (!isLoggedIn || user?.role.id !== 3) {
      router.push("/")
      return
    }

    // Initial load
    fetchAppointments()

    // Start polling for notifications
    pollingIntervalRef.current = setInterval(checkNotifications, NOTIFICATION_POLL_INTERVAL)

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [isLoggedIn, user?.role?.id])

  if (!isMounted) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1 w-fit">
            <Loader2 className="w-3 h-3 animate-spin" />
            Đang chờ xác nhận
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Đã chấp nhận
          </Badge>
        )
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Đã xác nhận
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Bị từ chối
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Hoàn thành
          </Badge>
        )
      case "canceled":
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" />
            Đã hủy
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDateTime = (appointment: Appointment) => {
    if (appointment.dateTime) {
      const date = new Date(appointment.dateTime)
      return {
        date: date.toLocaleDateString("vi-VN", { 
          weekday: "long", 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        }),
        time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      }
    }
    // Fallback to date + time fields
    const dateStr = appointment.date
    const timeStr = appointment.time
    if (dateStr && timeStr) {
      const date = new Date(`${dateStr}T${timeStr}`)
      return {
        date: date.toLocaleDateString("vi-VN", { 
          weekday: "long", 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        }),
        time: timeStr.slice(0, 5),
      }
    }
    return { date: 'N/A', time: 'N/A' }
  }

  const formatTimeSlot = (appointment: Appointment) => {
    const { time } = formatDateTime(appointment)
    const duration = appointment.duration || 30
    return `${time} (${duration} phút)`
  }

  // Helper function to check if appointment can be cancelled
  const canCancelAppointment = (appointment: Appointment): { canCancel: boolean; reason?: string } => {
    // Cannot cancel if already completed or canceled
    if (appointment.status === 'completed' || appointment.status === 'canceled' || appointment.status === 'cancelled') {
      return { canCancel: false, reason: 'Không thể hủy lịch hẹn đã hoàn thành hoặc đã hủy.' }
    }

    // Cannot cancel if rejected
    if (appointment.status === 'rejected') {
      return { canCancel: false, reason: 'Lịch hẹn đã bị từ chối, không thể hủy.' }
    }

    // Check if within 12 hours before appointment
    try {
      let appointmentDateTime: Date
      if (appointment.dateTime) {
        appointmentDateTime = new Date(appointment.dateTime)
      } else if (appointment.date && appointment.time) {
        appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
      } else {
        return { canCancel: false, reason: 'Không thể xác định thời gian lịch hẹn.' }
      }

      const now = new Date()
      const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntilAppointment < 12) {
        return { canCancel: false, reason: 'Không thể hủy lịch hẹn trong vòng 12 giờ trước giờ khám.' }
      }

      return { canCancel: true }
    } catch (error) {
      return { canCancel: false, reason: 'Không thể xác định thời gian lịch hẹn.' }
    }
  }

  const handleCancelClick = (appointment: Appointment) => {
    const { canCancel, reason } = canCancelAppointment(appointment)
    if (!canCancel) {
      toast({
        variant: 'destructive',
        title: 'Không thể hủy',
        description: reason || 'Không thể hủy lịch hẹn này.',
      })
      return
    }
    setAppointmentToCancel(appointment)
    setCancelDialogOpen(true)
  }

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return

    setCancelingId(appointmentToCancel.id)
    setCancelDialogOpen(false)
    
    try {
      const success = await appointmentsAPI.cancel(appointmentToCancel.id)
      if (success) {
        await fetchAppointments()
        toast({
          title: 'Thành công',
          description: 'Đã hủy lịch hẹn thành công.',
        })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.message
        || error.message
        || 'Không thể hủy lịch hẹn. Vui lòng thử lại.'
      
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: errorMessage,
      })
    } finally {
      setCancelingId(null)
      setAppointmentToCancel(null)
    }
  }

  const convertToDoctor = (appointment: Appointment): Doctor | null => {
    if (!appointment.doctor) return null
    return {
      id: appointment.doctor.id,
      user: appointment.doctor.user,
      specialty: appointment.doctor.specialty?.id || null,
      specialization: appointment.doctor.specialty?.name,
      price: appointment.doctor.price,
      experience: appointment.doctor.experience,
    }
  }

  const handleRateClick = (appointment: Appointment) => {
    const doctor = convertToDoctor(appointment)
    if (doctor) {
      setSelectedDoctor(doctor)
      setSelectedAppointmentId(appointment.id)
      setRatingModalOpen(true)
    }
  }

  const handleRatingSuccess = (ratingData: { rating: number; comment: string }) => {
    // Here you would call the API to save the rating
    console.log('Rating submitted:', {
      appointmentId: selectedAppointmentId,
      doctorId: selectedDoctor?.id,
      ...ratingData
    })
    
    toast({
      title: 'Thành công',
      description: 'Đã gửi đánh giá.',
    })
    
    // Show success message or update UI
    setRatingModalOpen(false)
    setSelectedDoctor(null)
    setSelectedAppointmentId(null)
  }

  const handleRescheduleClick = (appointment: Appointment) => {
    // Check if can reschedule (12 hours before)
    try {
      let appointmentDateTime: Date
      if (appointment.dateTime) {
        appointmentDateTime = new Date(appointment.dateTime)
      } else if (appointment.date && appointment.time) {
        appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
      } else {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể xác định thời gian lịch hẹn.',
        })
        return
      }

      const now = new Date()
      const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntilAppointment < 12) {
        toast({
          variant: 'destructive',
          title: 'Không thể đổi lịch',
          description: 'Không thể đổi lịch hẹn trong vòng 12 giờ trước giờ khám.',
        })
        return
      }

      setAppointmentToReschedule(appointment)
      setIsRescheduleModalOpen(true)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể xác định thời gian lịch hẹn.',
      })
    }
  }

  const handleRescheduleSuccess = async (appointment: Appointment) => {
    // Refresh appointments list
    await fetchAppointments()
    toast({
      title: 'Thành công',
      description: 'Đã đổi lịch hẹn thành công. Lịch hẹn đang chờ bác sĩ xác nhận lại.',
    })
    
    // Close modal
    setIsRescheduleModalOpen(false)
    setAppointmentToReschedule(null)
  }

  const handleRescheduleClose = () => {
    setIsRescheduleModalOpen(false)
    setAppointmentToReschedule(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} onSignIn={openSignIn} onSignUp={openSignUp} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Lịch hẹn của tôi</h1>
          <p className="text-muted-foreground">Xem tất cả các lịch hẹn đã đặt</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải danh sách lịch hẹn...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : appointments.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bạn chưa có lịch hẹn nào. Đặt lịch ngay bây giờ!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment)
              const doctor = appointment.doctor
              const doctorName = doctor?.user 
                ? `BS. ${doctor.user.first_name} ${doctor.user.last_name}`
                : "Bác sĩ"

              return (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center">
                          <User className="w-12 h-12 text-primary" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-1">
                              {doctorName}
                            </h3>
                            {doctor?.specialty && (
                              <p className="text-sm text-primary font-medium mb-4">
                                {doctor.specialty.name}
                              </p>
                            )}

                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">Ngày khám:</span>
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">Ca làm / Khung giờ:</span>
                                <span>{formatTimeSlot(appointment)}</span>
                              </div>
                              {appointment.notes && (
                                <div className="flex items-start gap-2 mt-3">
                                  <span className="font-medium text-foreground">Ghi chú:</span>
                                  <span>{appointment.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            {getStatusBadge(appointment.status)}
                            {appointment.status === "completed" && doctor && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRateClick(appointment)}
                                className="flex items-center gap-1"
                              >
                                <Star className="w-4 h-4" />
                                Đánh giá
                              </Button>
                            )}
                            <div className="flex flex-col gap-2">
                              {(appointment.status === "accepted" || appointment.status === "confirmed") && doctor && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRescheduleClick(appointment)}
                                >
                                  Đổi lịch
                                </Button>
                              )}
                              {(appointment.status === "pending" || 
                                appointment.status === "accepted" || 
                                appointment.status === "confirmed") && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleCancelClick(appointment)}
                                  disabled={cancelingId === appointment.id}
                                  className="text-destructive hover:text-destructive"
                                >
                                  {cancelingId === appointment.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      Đang hủy...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Hủy lịch
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!isLoading && !error && (
          <div className="mt-8 pt-8 border-t border-border">
            <Button onClick={() => router.push("/doctors")} className="bg-primary hover:bg-primary/90">
              Đặt lịch hẹn mới
            </Button>
          </div>
        )}
      </main>

      <Footer />

      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => {
          setRatingModalOpen(false)
          setSelectedDoctor(null)
          setSelectedAppointmentId(null)
        }}
        doctor={selectedDoctor || undefined}
        onSuccess={handleRatingSuccess}
      />

      <RescheduleAppointmentModal
        isOpen={isRescheduleModalOpen}
        onClose={handleRescheduleClose}
        appointment={appointmentToReschedule}
        onSuccess={handleRescheduleSuccess}
      />

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy lịch hẹn</AlertDialogTitle>
            <AlertDialogDescription>
              {appointmentToCancel && (
                <>
                  Bạn có chắc chắn muốn hủy lịch hẹn với{' '}
                  <strong>
                    {appointmentToCancel.doctor?.user 
                      ? `BS. ${appointmentToCancel.doctor.user.first_name} ${appointmentToCancel.doctor.user.last_name}`
                      : 'bác sĩ'}
                  </strong>{' '}
                  vào {formatDateTime(appointmentToCancel).date} lúc {formatDateTime(appointmentToCancel).time}?
                  <br />
                  <br />
                  Hành động này không thể hoàn tác.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
