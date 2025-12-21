'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { adminApi } from '@/services/api/admin';
import { Doctor } from '@/types/doctor';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Loader2,
  User,
  DollarSign,
  Briefcase,
  Eye,
  Star,
  Calendar,
  Clock,
  FileText,
  Pill
} from 'lucide-react';
import { ratingsAPI } from '@/services/api/ratings';
import { recordsAPI } from '@/services/api/records';
import { treatmentsAPI } from '@/services/api/treatments';
import { RatingByDoctorResponse } from '@/types/rating';
import { Appointment } from '@/types/appointment';
import { AppointmentRecord } from '@/types/record';
import { Treatment } from '@/types/treatment';

type VerificationStatus = 'ALL' | 'PENDING' | 'VERIFIED';

export default function DoctorsManagementPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus>('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [doctorRatings, setDoctorRatings] = useState<RatingByDoctorResponse | null>(null);
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedAppointmentForDetail, setSelectedAppointmentForDetail] = useState<Appointment | null>(null);
  const [isAppointmentDetailModalOpen, setIsAppointmentDetailModalOpen] = useState(false);
  const [appointmentRecord, setAppointmentRecord] = useState<AppointmentRecord | null>(null);
  const [appointmentTreatments, setAppointmentTreatments] = useState<Treatment[]>([]);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchQuery, statusFilter]);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const allDoctors = await adminApi.getAllDoctors();
      setDoctors(allDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch doctors. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(
        (doctor) => doctor.verificationStatus === statusFilter
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doctor) => {
        const firstName = doctor.user?.first_name?.toLowerCase() || '';
        const lastName = doctor.user?.last_name?.toLowerCase() || '';
        const email = doctor.user?.email?.toLowerCase() || '';
        const specialty = doctor.specialty_name?.toLowerCase() || '';
        return (
          firstName.includes(query) ||
          lastName.includes(query) ||
          email.includes(query) ||
          specialty.includes(query)
        );
      });
    }

    setFilteredDoctors(filtered);
  };

  const handleApprove = async () => {
    if (!selectedDoctor) return;

    try {
      setIsProcessing(true);
      await adminApi.verifyDoctor(selectedDoctor.id, 'VERIFIED');
      toast({
        title: 'Success',
        description: `Doctor ${selectedDoctor.user?.first_name} ${selectedDoctor.user?.last_name} has been approved.`,
      });
      setIsApproveDialogOpen(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve doctor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDoctor) return;

    try {
      setIsProcessing(true);
      await adminApi.verifyDoctor(selectedDoctor.id, 'REJECTED');
      toast({
        title: 'Success',
        description: `Doctor ${selectedDoctor.user?.first_name} ${selectedDoctor.user?.last_name} has been rejected.`,
      });
      setIsRejectDialogOpen(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject doctor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDetailModalOpen(true);
    setLoadingRatings(true);
    setLoadingAppointments(true);

    // Fetch appointments first (we need them to map with ratings)
    let doctorAppts: Appointment[] = [];
    try {
      const allAppointments = await adminApi.getAllAppointments();
      doctorAppts = allAppointments.filter(apt => apt.doctor?.id === doctor.id);
      setDoctorAppointments(doctorAppts);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setDoctorAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }

    // Fetch ratings
    try {
      const ratingsData = await ratingsAPI.getByDoctor(doctor.id);
      // Enrich ratings with appointment details
      if (ratingsData && ratingsData.ratings) {
        const enrichedRatings = ratingsData.ratings.map((rating) => {
          // Find appointment for this rating
          const appointment = doctorAppts.find(apt => apt.id === rating.appointment);
          return {
            ...rating,
            appointmentDetails: appointment,
          };
        });
        setDoctorRatings({
          ...ratingsData,
          ratings: enrichedRatings,
        });
      } else {
        setDoctorRatings(ratingsData);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setDoctorRatings(null);
    } finally {
      setLoadingRatings(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-600">Verified</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAppointmentStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-yellow-600' },
      accepted: { label: 'Accepted', className: 'bg-blue-600' },
      confirmed: { label: 'Confirmed', className: 'bg-green-600' },
      rejected: { label: 'Rejected', className: 'bg-red-600' },
      completed: { label: 'Completed', className: 'bg-purple-600' },
      canceled: { label: 'Canceled', className: 'bg-gray-600' },
      cancelled: { label: 'Canceled', className: 'bg-gray-600' },
    };

    const config = statusConfig[status || ''] || { label: status || 'Unknown', className: 'bg-gray-600' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleViewAppointmentDetails = async (appointment: Appointment) => {
    setSelectedAppointmentForDetail(appointment);
    setIsAppointmentDetailModalOpen(true);
    setLoadingRecord(true);
    setLoadingTreatments(true);

    // Fetch record
    try {
      const record = await recordsAPI.getByAppointment(appointment.id);
      setAppointmentRecord(record);
    } catch (error) {
      console.error('Error fetching record:', error);
      setAppointmentRecord(null);
    } finally {
      setLoadingRecord(false);
    }

    // Fetch treatments
    try {
      const treatments = await treatmentsAPI.getByAppointment(appointment.id);
      setAppointmentTreatments(treatments);
    } catch (error) {
      console.error('Error fetching treatments:', error);
      setAppointmentTreatments([]);
    } finally {
      setLoadingTreatments(false);
    }
  };

  const getDoctorName = (doctor: Doctor) => {
    if (doctor.user?.first_name && doctor.user?.last_name) {
      return `${doctor.user.first_name} ${doctor.user.last_name}`;
    }
    return doctor.user?.username || 'Unknown';
  };

  const getDoctorAvatar = (doctor: Doctor) => {
    return doctor.user?.avatar || '/placeholder-user.jpg';
  };

  const pendingCount = doctors.filter((d) => d.verificationStatus === 'PENDING').length;
  const verifiedCount = doctors.filter((d) => d.verificationStatus === 'VERIFIED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctors Management</h1>
        <p className="text-muted-foreground">
          Manage doctor registrations and verifications
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as VerificationStatus)}>
        <TabsList>
          <TabsTrigger value="ALL">
            All Doctors ({doctors.length})
          </TabsTrigger>
          <TabsTrigger value="PENDING">
            Pending Approval ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="VERIFIED">
            Verified ({verifiedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No doctors found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={getDoctorAvatar(doctor)} alt={getDoctorName(doctor)} />
                              <AvatarFallback>
                                {getDoctorName(doctor)
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{getDoctorName(doctor)}</div>
                              <div className="text-sm text-muted-foreground">
                                {doctor.user?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doctor.specialty_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {doctor.experience ? `${doctor.experience} years` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {doctor.price ? `$${doctor.price}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(doctor.verificationStatus)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(doctor)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {doctor.verificationStatus === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setIsApproveDialogOpen(true);
                                  }}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setIsRejectDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Doctor</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve{' '}
              <strong>
                {selectedDoctor?.user?.first_name} {selectedDoctor?.user?.last_name}
              </strong>
              ? This will verify their profile and make them available for appointments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveDialogOpen(false);
                setSelectedDoctor(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Doctor</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject{' '}
              <strong>
                {selectedDoctor?.user?.first_name} {selectedDoctor?.user?.last_name}
              </strong>
              ? This will mark their profile as rejected and they will not be available for appointments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setSelectedDoctor(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Doctor Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Doctor Details: {selectedDoctor?.user?.first_name} {selectedDoctor?.user?.last_name}
            </DialogTitle>
            <DialogDescription>
              View ratings and appointments for this doctor
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="ratings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ratings">
                <Star className="w-4 h-4 mr-2" />
                Ratings ({doctorRatings?.statistics?.total_ratings || 0})
              </TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="w-4 h-4 mr-2" />
                Appointments ({doctorAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ratings" className="mt-4">
              {loadingRatings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : doctorRatings ? (
                <div className="space-y-4">
                  {/* Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Average Rating</div>
                          <div className="text-2xl font-bold flex items-center gap-2">
                            {doctorRatings.statistics?.average_rating?.toFixed(1) || '0.0'}
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Ratings</div>
                          <div className="text-2xl font-bold">
                            {doctorRatings.statistics?.total_ratings || 0}
                          </div>
                        </div>
                      </div>
                      {doctorRatings.statistics?.rating_distribution && (
                        <div className="mt-4 space-y-2">
                          <div className="text-sm font-medium">Rating Distribution</div>
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-2">
                              <div className="w-12 text-sm">{rating} stars</div>
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{
                                    width: `${((doctorRatings.statistics.rating_distribution[rating] || 0) / (doctorRatings.statistics.total_ratings || 1)) * 100}%`,
                                  }}
                                />
                              </div>
                              <div className="w-12 text-sm text-right">
                                {doctorRatings.statistics.rating_distribution[rating] || 0}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Ratings List */}
                  {doctorRatings.ratings && doctorRatings.ratings.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">All Ratings</div>
                      {doctorRatings.ratings.map((rating: any) => {
                        const appointment = rating.appointmentDetails;
                        const patientName = rating.patient_name || 'Unknown Patient';
                        const patientEmail = appointment?.patient?.user?.email || '';
                        
                        return (
                          <Card key={rating.id}>
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                {/* Patient Info */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < (rating.rating || 0)
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'fill-gray-200 text-gray-200'
                                          }`}
                                        />
                                      ))}
                                      <span className="text-sm font-medium ml-2">
                                        {patientName}
                                      </span>
                                    </div>
                                    {patientEmail && (
                                      <div className="text-xs text-muted-foreground mb-2">
                                        {patientEmail}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Appointment Info */}
                                {appointment && (
                                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Appointment:</span>
                                      <span>
                                        {new Date(`${appointment.date}T${appointment.time}`).toLocaleString('vi-VN', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    </div>
                                    {appointment.notes && (
                                      <div className="text-xs text-muted-foreground ml-6">
                                        Notes: {appointment.notes}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Comment */}
                                {rating.comment && (
                                  <div className="border-t pt-3">
                                    <p className="text-sm text-foreground">
                                      {rating.comment}
                                    </p>
                                  </div>
                                )}

                                {/* Date */}
                                <div className="text-xs text-muted-foreground pt-2 border-t">
                                  Đánh giá vào: {new Date(rating.created_at).toLocaleString('vi-VN')}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No ratings yet
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No ratings data available
                </div>
              )}
            </TabsContent>

            <TabsContent value="appointments" className="mt-4">
              {loadingAppointments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : doctorAppointments.length > 0 ? (
                <div className="space-y-3">
                  {doctorAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {new Date(`${appointment.date}T${appointment.time}`).toLocaleString()}
                              </span>
                              {getAppointmentStatusBadge(appointment.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Patient: {appointment.patient?.user?.first_name} {appointment.patient?.user?.last_name}
                              </div>
                              {appointment.notes && (
                                <div className="mt-2">
                                  Notes: {appointment.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewAppointmentDetails(appointment)}
                            className="ml-4"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No appointments found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Modal */}
      <Dialog open={isAppointmentDetailModalOpen} onOpenChange={setIsAppointmentDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Appointment Details
            </DialogTitle>
            <DialogDescription>
              {selectedAppointmentForDetail && (
                <>
                  {new Date(`${selectedAppointmentForDetail.date}T${selectedAppointmentForDetail.time}`).toLocaleString()} - 
                  Patient: {selectedAppointmentForDetail.patient?.user?.first_name} {selectedAppointmentForDetail.patient?.user?.last_name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="record" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record">
                <FileText className="w-4 h-4 mr-2" />
                Medical Record
              </TabsTrigger>
              <TabsTrigger value="treatments">
                <Pill className="w-4 h-4 mr-2" />
                Prescriptions ({appointmentTreatments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="record" className="mt-4">
              {loadingRecord ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : appointmentRecord ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {appointmentRecord.reason && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Reason for Visit</h4>
                          <p className="text-sm text-muted-foreground">{appointmentRecord.reason}</p>
                        </div>
                      )}

                      {appointmentRecord.description && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{appointmentRecord.description}</p>
                        </div>
                      )}

                      {appointmentRecord.status_before && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Status Before</h4>
                          <p className="text-sm text-muted-foreground">{appointmentRecord.status_before}</p>
                        </div>
                      )}

                      {appointmentRecord.status_after && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Status After</h4>
                          <p className="text-sm text-muted-foreground">{appointmentRecord.status_after}</p>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground pt-4 border-t">
                        Created: {new Date(appointmentRecord.created_at).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No medical record available for this appointment
                </div>
              )}
            </TabsContent>

            <TabsContent value="treatments" className="mt-4">
              {loadingTreatments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : appointmentTreatments.length > 0 ? (
                <div className="space-y-4">
                  {appointmentTreatments.map((treatment) => (
                    <Card key={treatment.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              {treatment.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Purpose:</span> {treatment.purpose}
                            </p>
                          </div>

                          {treatment.drugs && treatment.drugs.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium text-foreground">Medications:</h4>
                              <div className="space-y-2">
                                {treatment.drugs.map((drugItem, index) => (
                                  <div key={drugItem.id || index} className="border rounded-lg p-4 bg-muted/50">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Pill className="w-4 h-4 text-primary" />
                                          <span className="font-medium text-foreground">
                                            {drugItem.drug?.name || 'Unknown Drug'}
                                          </span>
                                        </div>
                                        {drugItem.drug?.description && (
                                          <p className="text-sm text-muted-foreground">
                                            {drugItem.drug.description}
                                          </p>
                                        )}
                                        <div className="flex flex-wrap gap-2 text-sm">
                                          <Badge variant="outline">
                                            Dosage: {drugItem.dosage}
                                          </Badge>
                                          <Badge variant="outline">
                                            {drugItem.timing === 'before' && 'Before meal'}
                                            {drugItem.timing === 'after' && 'After meal'}
                                            {drugItem.timing === 'with' && 'With meal'}
                                            {drugItem.timing === 'anytime' && 'Anytime'}
                                            {drugItem.minutes_before_after && 
                                              ` (${drugItem.minutes_before_after} min)`}
                                          </Badge>
                                        </div>
                                        {drugItem.notes && (
                                          <p className="text-sm text-muted-foreground italic">
                                            Note: {drugItem.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {treatment.repeat_days && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Repeat:</span> {treatment.repeat_days}
                              {treatment.repeat_time && ` at ${treatment.repeat_time}`}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No prescriptions available for this appointment
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

