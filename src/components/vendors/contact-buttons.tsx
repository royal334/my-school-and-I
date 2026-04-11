'use client';

import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactButtons({
  vendorId,
  phoneNumber,
  whatsappNumber,
}: {
  vendorId: string;
  phoneNumber: string;
  whatsappNumber?: string;
}) {
  const handleContact = async (type: 'phone' | 'whatsapp') => {
    // Track contact
    await fetch('/api/vendors/track-event', {
      method: 'POST',
      body: JSON.stringify({
        vendor_id: vendorId,
        event: type === 'phone' ? 'contact_phone' : 'contact_whatsapp',
      }),
    });

    // Open contact method
    if (type === 'phone') {
      window.location.href = `tel:${phoneNumber}`;
    } else if (type === 'whatsapp' && whatsappNumber) {
      const message = encodeURIComponent('Hi, I found you on UniHub!');
      const number = whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/234${number.slice(1)}?text=${message}`);
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={() => handleContact('phone')} className="flex-1">
        <Phone className="mr-2 h-4 w-4" />
        Call Now
      </Button>
      
      {whatsappNumber && (
        <Button
          onClick={() => handleContact('whatsapp')}
          variant="outline"
          className="flex-1 bg-green-50 text-green-700 hover:bg-green-100"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </Button>
      )}
    </div>
  );
}