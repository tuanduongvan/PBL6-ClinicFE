'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ServicesManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Services Management</h1>
        <p className="text-muted-foreground">
          Manage clinic services and specialties
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Services management feature coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

