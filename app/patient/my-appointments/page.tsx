"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthContext } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockAppointments } from "@/data/mock-appointments"
import { mockDoctors } from "@/data/mock-doctors"
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function MyAppointmentsPage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (!isLoggedIn || user?.role !== 'patient') {
      router.push("/")
    }
  }, [isLoggedIn, user, router])

  if (!isMounted) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
            <Loader2 className="w-3 h-3" />
            Pending
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getDoctorInfo = (doctorId: string) => {
    return mockDoctors.find((d) => d.id === doctorId)
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} onSignIn={openSignIn} onSignUp={openSignUp} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Appointments</h1>
          <p className="text-muted-foreground">View all your scheduled appointments</p>
        </div>

        {mockAppointments.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>You don't have any appointments yet. Book one now!</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {mockAppointments.map((appointment) => {
              const doctor = getDoctorInfo(appointment.doctorId)
              const { date, time } = formatDateTime(appointment.dateTime)

              return (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {doctor && (
                        <div className="flex-shrink-0">
                          <img
                            src={doctor.avatar || "/placeholder.svg"}
                            alt={`Dr. ${doctor.firstName}`}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-1">
                              {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor"}
                            </h3>
                            {doctor && <p className="text-sm text-primary font-medium mb-4">{doctor.specialization}</p>}

                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {time} - {appointment.duration} minutes
                                </span>
                              </div>
                              {appointment.notes && (
                                <div className="flex items-start gap-2 mt-3">
                                  <span className="font-medium text-foreground">Notes:</span>
                                  <span>{appointment.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            {getStatusBadge(appointment.status)}
                            {appointment.status === "confirmed" && (
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                            )}
                            {appointment.status === "pending" && (
                              <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                                Cancel
                              </Button>
                            )}
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

        <div className="mt-8 pt-8 border-t border-border">
          <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
            Book Another Appointment
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
