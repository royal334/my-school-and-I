'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VendorForm from './vendor-form';
import VendorMediaEditor from './vendor-media-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface CreateVendorClientProps {
  categories: Array<{ id: string; name: string }>;
}

export default function CreateVendorClient({ categories }: CreateVendorClientProps) {
  const [vendor, setVendor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('details');

  const handleVendorCreated = (newVendor: any) => {
    setVendor(newVendor);
    setActiveTab('media');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="details">Business Details</TabsTrigger>
        <TabsTrigger value="media" disabled={!vendor}>
          Photos & Media
          {!vendor && <Lock className="ml-2 h-3 w-3 opacity-50" />}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <VendorForm
          categories={categories}
          mode="create"
          onSuccess={handleVendorCreated}
        />
      </TabsContent>

      <TabsContent value="media">
        {vendor ? (
          <VendorMediaEditor vendor={vendor} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Lock className="h-12 w-12 text-slate-300" />
              <h3 className="mt-4 font-semibold">Media Locked</h3>
              <p className="mt-2 text-sm text-slate-600">
                Please complete and save your business details first to enable media uploads.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
