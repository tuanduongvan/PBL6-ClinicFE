'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminApi } from '@/services/api/admin';
import { Appointment } from '@/types/appointment';
import { Calendar, Clock, User, Stethoscope, Eye, FileText, Pill, Loader2 } from 'lucide-react';
import { recordsAPI } from '@/services/api/records';
import { treatmentsAPI } from '@/services/api/treatments';
import { AppointmentRecord } from '@/types/record';
import { Treatment } from '@/types/treatment';

type AppointmentStatusFilter = 'ALL' | 'pending' | 'accepted' | 'confirmed' | 'rejected' | 'completed' | 'canceled';

export default function AppointmentsManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusFilter>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [appointmentRecord, setAppointmentRecord] = useState<AppointmentRecord | null>(null);
  const [appointmentTreatments, setAppointmentTreatments] = useState<Treatment[]>([]);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [loadingTreatments, setLoadingTreatments] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const allAppointments = await adminApi.getAllAppointments();
      setAppointments(allAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateB - dateA;
    });

    setFilteredAppointments(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-yellow-600' },
      accepted: { label: 'Accepted', className: 'bg-blue-600' },
      confirmed: { label: 'Confirmed', className: 'bg-green-600' },
      rejected: { label: 'Rejected', className: 'bg-red-600' },
      completed: { label: 'Completed', className: 'bg-purple-600' },
      canceled: { label: 'Canceled', className: 'bg-gray-600' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-600' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPatientName = (appointment: Appointment) => {
    if (appointment.patient?.user) {
      return `${appointment.patient.user.first_name} ${appointment.patient.user.last_name}`;
    }
    return 'Unknown Patient';
  };

  const getDoctorName = (appointment: Appointment) => {
    if (appointment.doctor?.user) {
      return `${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`;
    }
    return 'Unknown Doctor';
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(`${date}T${time}`);
      return dateObj.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return `${date} ${time}`;
    }
  };

  const handleViewDetails = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
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

  const statusCounts = {
    ALL: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    accepted: appointments.filter((a) => a.status === 'accepted').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    rejected: appointments.filter((a) => a.status === 'rejected').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    canceled: appointments.filter((a) => a.status === 'canceled').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments Management</h1>
        <p className="text-muted-foreground">
          View and manage all clinic appointments
        </p>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as AppointmentStatusFilter)}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="ALL">All ({statusCounts.ALL})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({statusCounts.accepted})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({statusCounts.confirmed})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
          <TabsTrigger value="canceled">Canceled ({statusCounts.canceled})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {formatDateTime(appointment.date, appointment.time)}
                              </div>
                              {appointment.duration && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {appointment.duration} min
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {getPatientName(appointment)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            {getDoctorName(appointment)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {appointment.doctor?.specialty?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(appointment.status)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {appointment.notes || 'No notes'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
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

      {/* Appointment Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Appointment Details
            </DialogTitle>
            <DialogDescription>
              {selectedAppointment && (
                <>
                  {formatDateTime(selectedAppointment.date, selectedAppointment.time)} - {getPatientName(selectedAppointment)} with {getDoctorName(selectedAppointment)}
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

