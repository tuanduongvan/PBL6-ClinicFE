"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthContext } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { appointmentsAPI } from "@/services/api/appointments"
import { recordsAPI } from "@/services/api/records"
import { treatmentsAPI } from "@/services/api/treatments"
import { useToast } from "@/hooks/use-toast"
import { Appointment } from "@/types/appointment"
import { AppointmentRecord } from "@/types/record"
import { Treatment } from "@/types/treatment"
import { Calendar, Clock, FileText, Pill, Loader2, AlertCircle, User } from "lucide-react"
import Link from "next/link"

interface MedicalHistoryItem {
  appointment: Appointment
  record?: AppointmentRecord
  treatments: Treatment[]
  date: Date
}

export default function MedicalHistoryPage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext()
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [history, setHistory] = useState<MedicalHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)

    if (!isLoggedIn || user?.role.id !== 3) {
      router.push("/")
      return
    }

    fetchHistory()
  }, [isLoggedIn, user?.role?.id, router])

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch all data in parallel
      const [appointments, records, treatments] = await Promise.all([
        appointmentsAPI.getMyAppointments(),
        recordsAPI.getMyRecords(),
        treatmentsAPI.getMyTreatments(),
      ])

      // Filter completed appointments
      const completedAppointments = appointments.filter(
        apt => apt.status === 'completed' || apt.status === 'accepted' || apt.status === 'confirmed'
      )

      // Create history items
      const historyItems: MedicalHistoryItem[] = completedAppointments.map(appointment => {
        const appointmentDate = appointment.dateTime 
          ? new Date(appointment.dateTime)
          : new Date(`${appointment.date}T${appointment.time}`)
        
        const record = records.find(r => r.appointment.id === appointment.id)
        const appointmentTreatments = treatments.filter(t => t.appointment.id === appointment.id)

        return {
          appointment,
          record,
          treatments: appointmentTreatments,
          date: appointmentDate,
        }
      })

      // Sort by date (newest first)
      historyItems.sort((a, b) => b.date.getTime() - a.date.getTime())

      setHistory(historyItems)
    } catch (err: any) {
      console.error('Error fetching history:', err)
      setError('Không thể tải lịch sử khám bệnh.')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải lịch sử khám bệnh.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) return null

  const formatDateTime = (date: Date) => {
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} onSignIn={openSignIn} onSignUp={openSignUp} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Lịch Sử Khám Bệnh</h1>
          <p className="text-muted-foreground">Xem toàn bộ lịch sử khám bệnh và điều trị của bạn</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải lịch sử khám bệnh...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : history.length === 0 ? (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Bạn chưa có lịch sử khám bệnh nào. Lịch sử sẽ được cập nhật sau khi hoàn thành các lịch hẹn.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {history.map((item) => {
              const { date, time } = formatDateTime(item.date)
              const doctor = item.appointment.doctor
              const doctorName = doctor?.user 
                ? `BS. ${doctor.user.first_name} ${doctor.user.last_name}`
                : "Bác sĩ"

              return (
                <Card key={item.appointment.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between pb-4 border-b">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">{doctorName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {item.appointment.status === 'completed' ? 'Hoàn thành' : 'Đã xác nhận'}
                        </Badge>
                      </div>

                      {/* Medical Record */}
                      {item.record && (
                        <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold text-foreground">Hồ Sơ Khám Bệnh</h4>
                          </div>
                          {item.record.reason && (
                            <div>
                              <span className="font-medium text-sm">Lý do khám: </span>
                              <span className="text-sm text-muted-foreground">{item.record.reason}</span>
                            </div>
                          )}
                          {item.record.description && (
                            <div>
                              <span className="font-medium text-sm">Mô tả: </span>
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                {item.record.description}
                              </p>
                            </div>
                          )}
                          {item.record.status_after && (
                            <div>
                              <span className="font-medium text-sm">Tình trạng sau khám: </span>
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                {item.record.status_after}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Prescriptions */}
                      {item.treatments.length > 0 && (
                        <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Pill className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold text-foreground">Đơn Thuốc</h4>
                          </div>
                          <div className="space-y-2">
                            {item.treatments.map((treatment) => (
                              <div key={treatment.id} className="p-3 bg-background rounded border">
                                <div className="font-medium text-sm mb-1">{treatment.name}</div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  <span className="font-medium">Mục đích: </span>
                                  {treatment.purpose}
                                </p>
                                {treatment.drug && (
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-medium">Thuốc: </span>
                                    {treatment.drug.name}
                                    {treatment.dosage && ` - ${treatment.dosage}`}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {item.record && (
                          <Link href="/patient/medical-records">
                            <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                              Xem chi tiết hồ sơ
                            </Badge>
                          </Link>
                        )}
                        {item.treatments.length > 0 && (
                          <Link href="/patient/prescriptions">
                            <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                              Xem chi tiết đơn thuốc
                            </Badge>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

