"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookingAppointmentModal } from "@/components/modals/booking-appointment-modal"
import { useAuthContext } from "@/components/auth-provider"
import type { Doctor } from "@/types"
import { mockDoctors } from "@/data/mock-doctors"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const doctorId = params.doctorId as string

  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(true)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (!isLoggedIn) {
      router.push("/")
      return
    }

    // Load doctor details
    const foundDoctor = mockDoctors.find((d) => d.id === doctorId)
    setDoctor(foundDoctor || null)
  }, [isLoggedIn, doctorId, router])

  const handleBookingSuccess = async (appointmentData: any) => {
    setBookingSuccess(true)
    setTimeout(() => {
      router.push("/patient/my-appointments")
    }, 2000)
  }

  const handleBookingClose = () => {
    setIsBookingOpen(false)
    router.push("/")
  }

  if (!isMounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} onSignIn={openSignIn} onSignUp={openSignUp} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {bookingSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Appointment booked successfully! Redirecting to your appointments...
            </AlertDescription>
          </Alert>
        )}

        {doctor ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <img
                  src={doctor.avatar || "/placeholder.svg"}
                  alt={`Dr. ${doctor.firstName}`}
                  className="w-32 h-32 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h1>
                  <p className="text-lg text-primary font-semibold mb-2">{doctor.specialization}</p>
                  <p className="text-muted-foreground mb-4">{doctor.bio}</p>
                  <div className="flex gap-8">
                    <div>
                      <div className="font-semibold text-foreground">{doctor.experience} Years</div>
                      <div className="text-sm text-muted-foreground">Experience</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{doctor.rating}★</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{doctor.patients}</div>
                      <div className="text-sm text-muted-foreground">Patients</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Doctor not found</p>
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
