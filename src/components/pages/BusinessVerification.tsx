import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { BusinessVerificationData } from '../../types/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';


interface BusinessVerificationProps {
  onSubmit: (data: BusinessVerificationData) => void;
  onSkip: () => void;
}


const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PAYMENT_OPTIONS = ['Cash', 'Credit Card', 'Debit Card', 'PayNow', 'GrabPay', 'PayLah'];


export function BusinessVerification({ onSubmit, onSkip }: BusinessVerificationProps) {
  const [formData, setFormData] = useState<BusinessVerificationData>({
    operatingDays: [],
    businessEmail: '',
    phone: '',
    website: '',
    socialMedia: '',
    wallpaper: null,
    priceTier: '',
    offersDelivery: false,
    offersPickup: false,
    paymentOptions: [],
  });


  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter(d => d !== day)
        : [...prev.operatingDays, day]
    }));
  };


  const handlePaymentToggle = (payment: string) => {
    setFormData(prev => ({
      ...prev,
      paymentOptions: prev.paymentOptions.includes(payment)
        ? prev.paymentOptions.filter(p => p !== payment)
        : [...prev.paymentOptions, payment]
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Create FormData to include file
    const formDataToSend = new FormData();
  
    // Append all fields
    formDataToSend.append('mode', 'signup');
    formDataToSend.append('role', 'business');


    formDataToSend.append('operatingDays', JSON.stringify(formData.operatingDays));
    formDataToSend.append('businessEmail', formData.businessEmail);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('website', formData.website);
    formDataToSend.append('socialMedia', formData.socialMedia);
    formDataToSend.append('priceTier', formData.priceTier);
    formDataToSend.append('offersDelivery', formData.offersDelivery ? '1' : '0');
    formDataToSend.append('offersPickup', formData.offersPickup ? '1' : '0');
    formDataToSend.append('paymentOptions', JSON.stringify(formData.paymentOptions));
  
    if (formData.wallpaper) {
      formDataToSend.append('wallpaper', formData.wallpaper);
    }
  
    try {
      const response = await fetch('http://localhost/final%20proj/IS216_WAD2_Grp3/backend/utils/processLogin.php', {
        method: 'POST',
        body: formDataToSend,
      });
  
      const result = await response.json();
      if (result.success) {
        alert('Verification submitted successfully');
        onSubmit(formData); // or refresh UI accordingly
      } else {
        alert('Submission failed: ' + (result.errors || 'Unknown error'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Error submitting verification: ' + errorMessage);
    }
  };
  


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow-md" style={{ backgroundColor: '#3a3a3a' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">LocalLoco</h1>
              <p className="text-sm opacity-90">
                Discover and support local businesses in your community - or nearby you!
              </p>
            </div>
          </div>
        </div>
      </header>


      {/* Verification Form */}
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="mb-2">Business Verification</h2>
            <p className="text-muted-foreground">
              Complete your business profile to get verified and start reaching customers
            </p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Operating Days */}
            <div className="space-y-4">
              <Label>Which days of the week is your business open?</Label>
              <div className="grid grid-cols-2 gap-4">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.operatingDays.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <label
                      htmlFor={day}
                      className="text-sm cursor-pointer"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>


            {/* Business Email */}
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input
                id="businessEmail"
                type="email"
                placeholder="Business Email"
                value={formData.businessEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
                required
                className="bg-input-background"
              />
            </div>


            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                className="bg-input-background"
              />
            </div>


            {/* Website Link */}
            <div className="space-y-2">
              <Label htmlFor="website">Website Link (https://)</Label>
              <Input
                id="website"
                type="url"
                placeholder="Website Link (https://)"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="bg-input-background"
              />
            </div>


            {/* Social Media Link */}
            <div className="space-y-2">
              <Label htmlFor="socialMedia">Social Media Link</Label>
              <Input
                id="socialMedia"
                type="url"
                placeholder="Social Media Link"
                value={formData.socialMedia}
                onChange={(e) => setFormData(prev => ({ ...prev, socialMedia: e.target.value }))}
                className="bg-input-background"
              />
            </div>


            {/* Business Wallpaper */}
            <div className="space-y-2">
              <Label htmlFor="wallpaper">Business Wallpaper</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="wallpaper"
                  className="cursor-pointer px-4 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                >
                  Choose File
                </label>
                <Input
                  id="wallpaper"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData(prev => ({ ...prev, wallpaper: e.target.files?.[0] || null }))}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground">
                  {formData.wallpaper ? formData.wallpaper.name : 'No file chosen'}
                </span>
              </div>
            </div>


            {/* Price Tier */}
            <div className="space-y-2">
              <Label htmlFor="priceTier">Price Tier</Label>
              <Select 
                value={formData.priceTier} 
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, priceTier: value }))}
              >
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder="Select price tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ - Budget Friendly</SelectItem>
                  <SelectItem value="$$">$$ - Moderate</SelectItem>
                  <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                  <SelectItem value="$$$$">$$$$ - Fine Dining</SelectItem>
                </SelectContent>
              </Select>
            </div>


            {/* Delivery & Pickup */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delivery"
                  checked={formData.offersDelivery}
                  onCheckedChange={(checked: boolean) => 
                    setFormData(prev => ({ ...prev, offersDelivery: checked }))
                  }
                />
                <label htmlFor="delivery" className="cursor-pointer">
                  Offers Delivery
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pickup"
                  checked={formData.offersPickup}
                  onCheckedChange={(checked: boolean) => 
                    setFormData(prev => ({ ...prev, offersPickup: checked }))
                  }
                />
                <label htmlFor="pickup" className="cursor-pointer">
                  Offers Pickup
                </label>
              </div>
            </div>


            {/* Payment Options */}
            <div className="space-y-4">
              <Label>Payment Options</Label>
              <div className="grid grid-cols-2 gap-4">
                {PAYMENT_OPTIONS.map(payment => (
                  <div key={payment} className="flex items-center space-x-2">
                    <Checkbox
                      id={payment}
                      checked={formData.paymentOptions.includes(payment)}
                      onCheckedChange={() => handlePaymentToggle(payment)}
                    />
                    <label
                      htmlFor={payment}
                      className="text-sm cursor-pointer"
                    >
                      {payment}
                    </label>
                  </div>
                ))}
              </div>
            </div>


            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                className="flex-1 text-foreground"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Submit Verification
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
