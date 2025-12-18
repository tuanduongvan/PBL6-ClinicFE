"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthContext } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { recordsAPI } from "@/services/api/records"
import { useToast } from "@/hooks/use-toast"
import { AppointmentRecord } from "@/types/record"
import { Calendar, Clock, User, FileText, Loader2, AlertCircle } from "lucide-react"

export default function MedicalRecordsPage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext()
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [records, setRecords] = useState<AppointmentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)

    if (!isLoggedIn || user?.role.id !== 3) {
      router.push("/")
      return
    }

    fetchRecords()
  }, [isLoggedIn, user?.role?.id, router])

  const fetchRecords = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await recordsAPI.getMyRecords()
      setRecords(data)
    } catch (err: any) {
      console.error('Error fetching records:', err)
      setError('Không thể tải danh sách hồ sơ khám bệnh.')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách hồ sơ khám bệnh.',
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} onSignIn={openSignIn} onSignUp={openSignUp} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Hồ Sơ Khám Bệnh</h1>
          <p className="text-muted-foreground">Xem tất cả các hồ sơ khám bệnh của bạn</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải danh sách hồ sơ khám bệnh...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : records.length === 0 ? (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Bạn chưa có hồ sơ khám bệnh nào. Hồ sơ sẽ được tạo sau khi hoàn thành các lịch hẹn.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {records.map((record) => {
              const { date, time } = formatDateTime(
                record.appointment.date,
                record.appointment.time
              )
              const doctor = record.appointment.doctor
              const doctorName = doctor?.user 
                ? `BS. ${doctor.user.first_name} ${doctor.user.last_name}`
                : "Bác sĩ"

              return (
                <Card key={record.id} className="hover:shadow-lg transition-shadow duration-300">
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
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <FileText className="w-3 h-3 mr-1" />
                        Hồ sơ khám
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {record.reason && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Lý do khám:</h4>
                        <p className="text-sm text-muted-foreground">{record.reason}</p>
                      </div>
                    )}

                    {record.description && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Mô tả:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{record.description}</p>
                      </div>
                    )}

                    {record.status_before && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Tình trạng trước khám:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{record.status_before}</p>
                      </div>
                    )}

                    {record.status_after && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Tình trạng sau khám:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{record.status_after}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t text-xs text-muted-foreground">
                      Tạo lúc: {new Date(record.created_at).toLocaleString("vi-VN")}
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

