"use client";

import { Doctor } from '@/types/doctor';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Stethoscope, Clock } from 'lucide-react';
import Link from 'next/link';

interface DoctorCardProps {
  doctor: Doctor;
  onBooking?: () => void;
}

export function DoctorCard({ doctor, onBooking }: DoctorCardProps) {
  // Hỗ trợ cả dữ liệu từ backend (doctor.user) và dữ liệu mock (field phẳng)
  const user = doctor.user || {
    first_name: doctor.first_name || doctor.firstName || '',
    last_name: doctor.last_name || doctor.lastName || '',
    username: doctor.username || 'Bác sĩ',
    avatar: doctor.avatar || null,
    email: '',
    phone: doctor.phone || '',
    role: 2,
    date_joined: '',
    is_active: true,
  };

  const fullName =
    (user.first_name || user.last_name)
      ? `${user.first_name} ${user.last_name}`.trim()
      : user.username || 'Bác sĩ';

  const avatarSrc = user.avatar && user.avatar !== '' ? user.avatar : '/placeholder-user.jpg';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardContent className="p-0">
        <div className="relative h-48 bg-muted">
          <img
            src={avatarSrc}
            alt={fullName}
            className="w-full h-full object-cover"
          />
          {doctor.is_available && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Sẵn sàng
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <div>
            <h3 className="font-bold text-lg text-foreground">BS. {fullName}</h3>
            <div className="flex items-center text-primary text-sm font-medium">
              <Stethoscope className="w-4 h-4 mr-1" />
              <span>
                Chuyên khoa {doctor.specialization || (doctor.specialty ? `#${doctor.specialty}` : 'Tổng quát')}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
              <span>
                {doctor.rating || 0} ({doctor.patients || 0} bệnh nhân)
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Phòng {doctor.room || '--'}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {doctor.description || 'Bác sĩ chưa cập nhật thông tin giới thiệu.'}
          </p>

          <div className="font-semibold text-primary">
            {(doctor.price || 0).toLocaleString()} VND{' '}
            <span className="text-xs font-normal text-muted-foreground">/ lần khám</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 mt-auto grid gap-2">
        <Button className="w-full" onClick={onBooking}>
          Đặt Lịch Ngay
        </Button>
        <Link href={`/patient/booking/${doctor.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Xem Chi Tiết
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}