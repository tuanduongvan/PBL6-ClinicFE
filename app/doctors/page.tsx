'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { DoctorCard } from '@/components/doctor-card';
import { BookingAppointmentModal } from '@/components/modals/booking-appointment-modal';
import { doctorsApi } from '@/services/api/doctors';
import { specialitiesAPI } from '@/services/api/specialities';
import type { Doctor } from '@/types/doctor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Filter, X } from 'lucide-react';
import { useAuthContext } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';

export default function DoctorsPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [specialities, setSpecialities] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'experience'>('name');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [doctorsData, specialitiesData] = await Promise.all([
          doctorsApi.getAll(),
          specialitiesAPI.getAll(),
        ]);
        setAllDoctors(doctorsData);
        setDoctors(doctorsData);
        setSpecialities(specialitiesData.map(s => ({ id: s.id, name: s.name })));
        if (!doctorsData.length) {
          setError('Không lấy được danh sách bác sĩ từ API.');
        }
      } catch (err: any) {
        setError('Không lấy được danh sách bác sĩ từ API.');
        setDoctors([]);
        setAllDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort doctors
  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = [...allDoctors];

    // Search by name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor => {
        const firstName = doctor.user?.first_name?.toLowerCase() || '';
        const lastName = doctor.user?.last_name?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`;
        return fullName.includes(query) || firstName.includes(query) || lastName.includes(query);
      });
    }

    // Filter by speciality
    if (selectedSpeciality !== 'all') {
      const specialityId = parseInt(selectedSpeciality);
      filtered = filtered.filter(doctor => doctor.specialty === specialityId);
    }

    // Filter by price range
    if (priceRange !== 'all') {
      filtered = filtered.filter(doctor => {
        const price = doctor.price || 0;
        if (priceRange === 'low') return price < 500000;
        if (priceRange === 'medium') return price >= 500000 && price < 1000000;
        if (priceRange === 'high') return price >= 1000000;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.toLowerCase();
        const nameB = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'price') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'experience') {
        return (b.experience || 0) - (a.experience || 0);
      }
      return 0;
    });

    return filtered;
  }, [allDoctors, searchQuery, selectedSpeciality, sortBy, priceRange]);

  useEffect(() => {
    setDoctors(filteredAndSortedDoctors);
  }, [filteredAndSortedDoctors]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpeciality('all');
    setSortBy('name');
    setPriceRange('all');
  };

  useEffect(() => {
    if (!isLoggedIn || user?.role.id !== 3) {
      router.push('/');
      return;
    }
  }, [isLoggedIn, user?.role.id, router]);

  const handleBookDoctor = (doctor: Doctor) => {
    if (!isLoggedIn) {
      openSignIn();
      return;
    }

    if (user?.role.id === 2) {
      window.location.href = '/doctor/dashboard';
      return;
    }

    if (user?.role.id === 3) {
      setSelectedDoctor(doctor);
      setIsBookingOpen(true);
    }
  };

  const handleBookingSuccess = () => {
    setIsBookingOpen(false);
    setSelectedDoctor(null);
  };

  const handleBookingClose = () => {
    setIsBookingOpen(false);
    setSelectedDoctor(null);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={logout}
        onSignIn={openSignIn}
        onSignUp={openSignUp}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Danh sách bác sĩ</h1>
          <p className="text-muted-foreground">
            Chọn bác sĩ phù hợp và đặt lịch hẹn trực tiếp.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm bác sĩ theo tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Speciality Filter */}
            <Select value={selectedSpeciality} onValueChange={setSelectedSpeciality}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Chuyên khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
                {specialities.map((spec) => (
                  <SelectItem key={spec.id} value={spec.id.toString()}>
                    {spec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select value={priceRange} onValueChange={(value: any) => setPriceRange(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Mức giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức giá</SelectItem>
                <SelectItem value="low">Dưới 500k</SelectItem>
                <SelectItem value="medium">500k - 1 triệu</SelectItem>
                <SelectItem value="high">Trên 1 triệu</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Theo tên</SelectItem>
                <SelectItem value="price">Giá tăng dần</SelectItem>
                <SelectItem value="experience">Kinh nghiệm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedSpeciality !== 'all' || priceRange !== 'all' || sortBy !== 'name') && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Xóa bộ lọc
              </Button>
              <span className="text-sm text-muted-foreground">
                Tìm thấy {filteredAndSortedDoctors.length} bác sĩ
              </span>
            </div>
          )}
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Đang tải danh sách bác sĩ...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBooking={() => handleBookDoctor(doctor)}
              />
            ))}
          </div>
        )}
      </main>

      <BookingAppointmentModal
        isOpen={isBookingOpen && !!selectedDoctor}
        onClose={handleBookingClose}
        doctor={selectedDoctor || undefined}
        onSuccess={handleBookingSuccess}
      />

      <Footer />
    </div>
  );
}