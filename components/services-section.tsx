"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Zap, Heart, Shield } from "lucide-react"

export function ServicesSection() {
  const services = [
    {
      icon: Heart,
      title: "Acne Treatment",
      description: "Advanced acne treatment solutions for all skin types and conditions.",
    },
    {
      icon: Sparkles,
      title: "Anti-Aging",
      description: "Rejuvenation and anti-aging treatments with proven results.",
    },
    {
      icon: Zap,
      title: "Skin Surgery",
      description: "Professional mole removal and surgical skin procedures.",
    },
    {
      icon: Shield,
      title: "Preventive Care",
      description: "Comprehensive skin health maintenance and prevention strategies.",
    },
  ]

  return (
    <section id="services-section" className="py-16 sm:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">Our Services</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive dermatological services tailored to your unique skin needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-background/50 backdrop-blur"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
