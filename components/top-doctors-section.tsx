'use client';

import { Doctor } from '@/types/doctor';
import { DoctorCard } from './doctor-card';

interface TopDoctorsSectionProps {
  doctors: Doctor[];
  onBookDoctor?: (doctor: Doctor) => void;
}

export function TopDoctorsSection({ doctors, onBookDoctor }: TopDoctorsSectionProps) {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-secondary/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Top Doctors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our most experienced and highly-rated dermatologists ready to help
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <DoctorCard
                doctor={doctor}
                onBooking={() => onBookDoctor?.(doctor)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
