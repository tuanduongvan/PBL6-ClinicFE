"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthContext } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { treatmentsAPI } from "@/services/api/treatments"
import { useToast } from "@/hooks/use-toast"
import { Treatment } from "@/types/treatment"
import { Calendar, Clock, Pill, Loader2, AlertCircle } from "lucide-react"

export default function PrescriptionsPage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext()
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)

    if (!isLoggedIn || user?.role.id !== 3) {
      router.push("/")
      return
    }

    fetchTreatments()
  }, [isLoggedIn, user?.role?.id, router])

  const fetchTreatments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await treatmentsAPI.getMyTreatments()
      // Group by appointment
      const grouped = data.reduce((acc, treatment) => {
        const appointmentId = treatment.appointment.id
        if (!acc[appointmentId]) {
          acc[appointmentId] = {
            appointment: treatment.appointment,
            treatments: []
          }
        }
        acc[appointmentId].treatments.push(treatment)
        return acc
      }, {} as Record<number, { appointment: Treatment['appointment'], treatments: Treatment[] }>)
      
      // Convert to array and sort by date
      const sorted = Object.values(grouped).sort((a, b) => {
        const dateA = new Date(`${a.appointment.date}T${a.appointment.time}`)
        const dateB = new Date(`${b.appointment.date}T${b.appointment.time}`)
        return dateB.getTime() - dateA.getTime()
      })
      
      setTreatments(data)
    } catch (err: any) {
      console.error('Error fetching treatments:', err)
      setError('Không thể tải danh sách đơn thuốc.')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách đơn thuốc.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) return null

  const formatDateTime = (dateStr: string, timeStr?: string) => {
    if (timeStr) {
      const date = new Date(`${dateStr}T${timeStr}`)
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
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString("vi-VN", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      }),
      time: '',
    }
  }

  // Group treatments by appointment
  const groupedTreatments = treatments.reduce((acc, treatment) => {
    const appointmentId = treatment.appointment.id
    if (!acc[appointmentId]) {
      acc[appointmentId] = {
        appointment: treatment.appointment,
        treatments: []
      }
    }
    acc[appointmentId].treatments.push(treatment)
    return acc
  }, {} as Record<number, { appointment: Treatment['appointment'], treatments: Treatment[] }>)

  const sortedGroups = Object.values(groupedTreatments).sort((a, b) => {
    const dateA = new Date(`${a.appointment.date}T${a.appointment.time}`)
    const dateB = new Date(`${b.appointment.date}T${b.appointment.time}`)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} onSignIn={openSignIn} onSignUp={openSignUp} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Đơn Thuốc</h1>
          <p className="text-muted-foreground">Xem tất cả các đơn thuốc đã được kê</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải danh sách đơn thuốc...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : sortedGroups.length === 0 ? (
          <Alert>
            <Pill className="h-4 w-4" />
            <AlertDescription>
              Bạn chưa có đơn thuốc nào. Đơn thuốc sẽ được tạo sau khi khám bệnh.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {sortedGroups.map((group) => {
              const { date, time } = formatDateTime(
                group.appointment.date,
                group.appointment.time
              )
              const doctor = group.appointment.doctor
              const doctorName = doctor?.user 
                ? `BS. ${doctor.user.first_name} ${doctor.user.last_name}`
                : "Bác sĩ"

              return (
                <Card key={group.appointment.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{doctorName}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{date}</span>
                          </div>
                          {time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Pill className="w-3 h-3 mr-1" />
                        Đơn thuốc
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {group.treatments.map((treatment) => (
                      <div key={treatment.id} className="p-4 bg-secondary/30 rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-foreground">{treatment.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Mục đích: </span>
                          {treatment.purpose}
                        </p>
                        {treatment.drug && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Thuốc: </span>
                            {treatment.drug.name}
                          </p>
                        )}
                        {treatment.dosage && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Liều lượng: </span>
                            {treatment.dosage}
                          </p>
                        )}
                        {treatment.repeat_days && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Lặp lại: </span>
                            {treatment.repeat_days} ngày
                          </p>
                        )}
                        {treatment.repeat_time && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Thời gian uống: </span>
                            {treatment.repeat_time.slice(0, 5)}
                          </p>
                        )}
                      </div>
                    ))}
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

