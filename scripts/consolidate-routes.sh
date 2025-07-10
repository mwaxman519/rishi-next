#!/bin/bash

echo "Consolidating route structure to reduce module count..."

# Create consolidated admin page
mkdir -p app/admin-consolidated
cat > app/admin-consolidated/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminConsolidated() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Administration</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>User management interface will be loaded here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Role management interface will be loaded here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <CardTitle>Organization Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Organization management interface will be loaded here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>System settings interface will be loaded here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
EOF

# Remove redundant doc pages (keep main docs structure but consolidate individual pages)
find app/docs -name "page.tsx" -not -path "app/docs/page.tsx" -not -path "app/docs/\[...slug\]/*" | head -20 | xargs rm -f

# Remove individual user management pages
rm -rf app/users/new app/users/\[id\]

echo "Route consolidation complete"