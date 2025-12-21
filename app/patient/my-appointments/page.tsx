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
import { ratingsAPI } from "@/services/api/ratings"
import { notificationsAPI, Notification } from "@/services/api/notifications"
import { treatmentsAPI } from "@/services/api/treatments"
import { recordsAPI } from "@/services/api/records"
import { useToast } from "@/hooks/use-toast"
import { Appointment } from "@/types/appointment"
import { Doctor } from "@/types/doctor"
import { Rating } from "@/types/rating"
import { Treatment } from "@/types/treatment"
import { AppointmentRecord } from "@/types/record"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2, Star, XCircle, User, Pill, FileText, Eye } from "lucide-react"

const NOTIFICATION_POLL_INTERVAL = 5000; // 5 seconds

export default function MyAppointmentsPage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext()
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null)
  const [cancelingId, setCancelingId] = useState<number | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null)
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false)
  const [recordModalOpen, setRecordModalOpen] = useState(false)
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState<Appointment | null>(null)
  const [selectedAppointmentForRecord, setSelectedAppointmentForRecord] = useState<Appointment | null>(null)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [record, setRecord] = useState<AppointmentRecord | null>(null)
  const [loadingTreatments, setLoadingTreatments] = useState(false)
  const [loadingRecord, setLoadingRecord] = useState(false)
  const readNotificationIds = useRef<Set<number>>(new Set())
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [appointmentsData, ratingsData] = await Promise.all([
        appointmentsAPI.getMyAppointments(),
        ratingsAPI.getAll()
      ])
      setAppointments(appointmentsData)
      setRatings(ratingsData)
      // Debug: Log ratings to check structure
      console.log('Fetched ratings:', ratingsData)
      if (ratingsData.length > 0) {
        console.log('First rating:', ratingsData[0])
        console.log('First rating appointment:', ratingsData[0].appointment, typeof ratingsData[0].appointment)
      }
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
    if (appointment.status === 'completed' || appointment.status === 'canceled') {
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
      // user field is omitted since Appointment.doctor.user only has partial user data
      // and Doctor.user requires full User object with all properties
      specialty: appointment.doctor.specialty?.id || null,
      specialization: appointment.doctor.specialty?.name,
      price: appointment.doctor.price,
      experience: appointment.doctor.experience,
    }
  }

  const handleRateClick = async (appointment: Appointment) => {
    // Double check: Verify with API before opening modal
    try {
      const existingRating = await ratingsAPI.getByAppointment(appointment.id);
      if (existingRating) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Lịch hẹn này đã được đánh giá.',
        });
        // Refresh to update UI
        await fetchAppointments();
        return;
      }
    } catch (err: any) {
      // 404 is expected if no rating exists, ignore it
      if (err.response?.status !== 404) {
        console.error('Error checking rating:', err);
      }
    }
    
    // Also check local state
    if (hasRating(appointment.id)) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Lịch hẹn này đã được đánh giá.',
      });
      return;
    }
    
    const doctor = convertToDoctor(appointment)
    if (doctor) {
      setSelectedDoctor(doctor)
      setSelectedAppointment(appointment)
      setRatingModalOpen(true)
    }
  }

  const handleRatingSuccess = async () => {
    // Refresh appointments and ratings list after rating
    await fetchAppointments()
    
    setRatingModalOpen(false)
    setSelectedDoctor(null)
    setSelectedAppointment(null)
  }

  // Helper function to check if appointment has rating
  const hasRating = (appointmentId: number): boolean => {
    if (!ratings || ratings.length === 0) {
      console.log(`No ratings found for appointment ${appointmentId}`);
      return false;
    }
    
    const hasRatingResult = ratings.some(rating => {
      // appointment is now always a number (ID) from backend
      const ratingAppointmentId = typeof rating.appointment === 'number' 
        ? rating.appointment 
        : (rating.appointment as any)?.id;
      
      const matches = ratingAppointmentId === appointmentId;
      if (matches) {
        console.log(`Found rating for appointment ${appointmentId}:`, rating);
      }
      return matches;
    });
    
    console.log(`hasRating(${appointmentId}):`, hasRatingResult, 'Total ratings:', ratings.length);
    return hasRatingResult;
  }

  // Helper function to get rating for appointment
  const getRatingForAppointment = (appointmentId: number): Rating | undefined => {
    return ratings.find(rating => {
      // appointment is now always a number (ID) from backend
      const ratingAppointmentId = typeof rating.appointment === 'number' 
        ? rating.appointment 
        : (rating.appointment as any)?.id;
      return ratingAppointmentId === appointmentId;
    })
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

  const handleViewPrescription = async (appointment: Appointment) => {
    setSelectedAppointmentForPrescription(appointment)
    setLoadingTreatments(true)
    setPrescriptionModalOpen(true)
    
    try {
      const treatmentsData = await treatmentsAPI.getByAppointment(appointment.id)
      setTreatments(treatmentsData)
      if (treatmentsData.length === 0) {
        toast({
          title: 'Thông báo',
          description: 'Chưa có đơn thuốc cho lịch hẹn này.',
        })
      }
    } catch (error: any) {
      console.error('Error fetching treatments:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải đơn thuốc. Vui lòng thử lại.',
      })
      setTreatments([])
    } finally {
      setLoadingTreatments(false)
    }
  }

  const handleViewRecord = async (appointment: Appointment) => {
    setSelectedAppointmentForRecord(appointment)
    setLoadingRecord(true)
    setRecordModalOpen(true)
    
    try {
      const recordData = await recordsAPI.getByAppointment(appointment.id)
      setRecord(recordData)
      if (!recordData) {
        toast({
          title: 'Thông báo',
          description: 'Chưa có kết quả thăm khám cho lịch hẹn này.',
        })
      }
    } catch (error: any) {
      console.error('Error fetching record:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải kết quả thăm khám. Vui lòng thử lại.',
      })
      setRecord(null)
    } finally {
      setLoadingRecord(false)
    }
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
                              hasRating(appointment.id) ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled
                                  className="flex items-center gap-1 opacity-60 cursor-not-allowed"
                                >
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  Đã đánh giá
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRateClick(appointment)}
                                  className="flex items-center gap-1"
                                >
                                  <Star className="w-4 h-4" />
                                  Đánh giá
                                </Button>
                              )
                            )}
                            {appointment.status === "completed" && (
                              <div className="flex flex-col gap-2 w-full">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewPrescription(appointment)}
                                  className="flex items-center gap-1 w-full"
                                >
                                  <Pill className="w-4 h-4" />
                                  Xem đơn thuốc
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewRecord(appointment)}
                                  className="flex items-center gap-1 w-full"
                                >
                                  <Eye className="w-4 h-4" />
                                  Chi tiết
                                </Button>
                              </div>
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
          setSelectedAppointment(null)
        }}
        doctor={selectedDoctor || undefined}
        appointment={selectedAppointment || undefined}
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

      {/* Prescription Modal */}
      <Dialog open={prescriptionModalOpen} onOpenChange={setPrescriptionModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Đơn thuốc
            </DialogTitle>
            <DialogDescription>
              {selectedAppointmentForPrescription && (
                <>
                  Lịch hẹn ngày {formatDateTime(selectedAppointmentForPrescription).date} lúc {formatDateTime(selectedAppointmentForPrescription).time}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {loadingTreatments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : treatments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Chưa có đơn thuốc cho lịch hẹn này.
            </div>
          ) : (
            <div className="space-y-6">
              {treatments.map((treatment) => (
                <Card key={treatment.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {treatment.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Mục đích:</span> {treatment.purpose}
                        </p>
                      </div>

                      {treatment.drugs && treatment.drugs.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-foreground">Danh sách thuốc:</h4>
                          <div className="space-y-2">
                            {treatment.drugs.map((drugItem, index) => (
                              <div key={drugItem.id || index} className="border rounded-lg p-4 bg-muted/50">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Pill className="w-4 h-4 text-primary" />
                                      <span className="font-medium text-foreground">
                                        {drugItem.drug?.name || 'Thuốc không xác định'}
                                      </span>
                                    </div>
                                    {drugItem.drug?.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {drugItem.drug.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 text-sm">
                                      <Badge variant="outline">
                                        Liều lượng: {drugItem.dosage}
                                      </Badge>
                                      <Badge variant="outline">
                                        {drugItem.timing === 'before' && 'Trước bữa ăn'}
                                        {drugItem.timing === 'after' && 'Sau bữa ăn'}
                                        {drugItem.timing === 'with' && 'Trong bữa ăn'}
                                        {drugItem.timing === 'anytime' && 'Bất kỳ lúc nào'}
                                        {drugItem.minutes_before_after && 
                                          ` (${drugItem.minutes_before_after} phút)`}
                                      </Badge>
                                    </div>
                                    {drugItem.notes && (
                                      <p className="text-sm text-muted-foreground italic">
                                        Ghi chú: {drugItem.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {treatment.repeat_days && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Lặp lại:</span> {treatment.repeat_days}
                          {treatment.repeat_time && ` lúc ${treatment.repeat_time}`}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Modal */}
      <Dialog open={recordModalOpen} onOpenChange={setRecordModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Kết quả thăm khám
            </DialogTitle>
            <DialogDescription>
              {selectedAppointmentForRecord && (
                <>
                  Lịch hẹn ngày {formatDateTime(selectedAppointmentForRecord).date} lúc {formatDateTime(selectedAppointmentForRecord).time}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {loadingRecord ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !record ? (
            <div className="py-8 text-center text-muted-foreground">
              Chưa có kết quả thăm khám cho lịch hẹn này.
            </div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {record.reason && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Lý do khám:</h4>
                        <p className="text-sm text-muted-foreground">{record.reason}</p>
                      </div>
                    )}

                    {record.description && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Mô tả:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{record.description}</p>
                      </div>
                    )}

                    {record.status_before && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Tình trạng trước khám:</h4>
                        <p className="text-sm text-muted-foreground">{record.status_before}</p>
                      </div>
                    )}

                    {record.status_after && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Tình trạng sau khám:</h4>
                        <p className="text-sm text-muted-foreground">{record.status_after}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
