"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Doctor } from "@/types"
import { Star, Users, Award } from "lucide-react"

interface DoctorCardProps {
  doctor: Doctor
  onBooking?: () => void
}

export function DoctorCard({ doctor, onBooking }: DoctorCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Card
      className="hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden bg-background/50 backdrop-blur border-primary/10 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden h-48 bg-gradient-to-br from-primary/10 to-accent/10">
        <img
          src={doctor.avatar || "/placeholder.svg"}
          alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
        />

        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground animate-pulse">
          {doctor.specialization}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-foreground group-hover:text-primary transition-colors duration-300">
              Dr. {doctor.firstName} {doctor.lastName}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {doctor.experience} years experience
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{doctor.bio}</p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-secondary/30 hover:bg-primary/20 rounded-lg p-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-accent animate-bounce" />
              <span className="font-semibold text-foreground">{doctor.rating}</span>
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div className="bg-secondary/30 hover:bg-accent/20 rounded-lg p-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-accent/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{doctor.patients}</span>
            </div>
            <div className="text-xs text-muted-foreground">Patients</div>
          </div>
          <div className="bg-secondary/30 hover:bg-primary/20 rounded-lg p-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-4 h-4 text-accent" />
              <span className="font-semibold text-foreground">{doctor.experience}</span>
            </div>
            <div className="text-xs text-muted-foreground">Years</div>
          </div>
        </div>

        <Button
          onClick={onBooking}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
        >
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  )
}
