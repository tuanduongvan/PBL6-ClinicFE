'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { adminApi } from '@/services/api/admin';
import { User } from '@/types/auth';
import { Search, UserCheck, AlertCircle } from 'lucide-react';

export default function PatientsManagementPage() {
  const [patients, setPatients] = useState<User[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchQuery]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setAccessError(null);
      const allPatients = await adminApi.getAllUsers({ role: 3 });
      setPatients(allPatients);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      // If 403, user doesn't have admin permissions (is_staff)
      if (error.response?.status === 403) {
        setAccessError('Access denied: Your account needs admin staff permissions (is_staff) to view all patients. Please contact system administrator.');
      } else {
        setAccessError('Failed to fetch patients. Please try again.');
      }
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((patient) => {
        const firstName = patient.first_name?.toLowerCase() || '';
        const lastName = patient.last_name?.toLowerCase() || '';
        const email = patient.email?.toLowerCase() || '';
        const username = patient.username?.toLowerCase() || '';
        const phone = patient.phone?.toLowerCase() || '';
        return (
          firstName.includes(query) ||
          lastName.includes(query) ||
          email.includes(query) ||
          username.includes(query) ||
          phone.includes(query)
        );
      });
    }

    setFilteredPatients(filtered);
  };

  const getPatientName = (patient: User) => {
    return `${patient.first_name} ${patient.last_name}`;
  };

  const getPatientAvatar = (patient: User) => {
    return patient.avatar || '/placeholder-user.jpg';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patients Management</h1>
        <p className="text-muted-foreground">
          View and manage all registered patients
        </p>
      </div>

      {/* Error Alert */}
      {accessError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{accessError}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, username, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No patients found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getPatientAvatar(patient)} alt={getPatientName(patient)} />
                          <AvatarFallback>
                            {patient.first_name?.[0] || ''}
                            {patient.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{getPatientName(patient)}</div>
                          <div className="text-sm text-muted-foreground">
                            @{patient.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      {patient.gender?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {patient.is_active ? (
                        <Badge className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.id ? `ID: ${patient.id}` : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

