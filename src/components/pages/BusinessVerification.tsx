import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { BusinessVerificationData } from '../../types/auth';
import { useNavigate } from 'react-router-dom';
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
  onSubmit?: (data: BusinessVerificationData) => void;
  onSkip?: () => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PAYMENT_OPTIONS = ['Cash', 'Credit Card', 'Debit Card', 'PayNow', 'GrabPay', 'PayLah'];

const convertPriceTier = (tier: string): "" | "$" | "$$" | "$$$" | "$$$$" => {
  const mapping: Record<string, "" | "$" | "$$" | "$$$" | "$$$$"> = {
    'low': '$',
    'medium': '$$',
    'high': '$$$',
    '$': '$',
    '$$': '$$',
    '$$$': '$$$',
    '$$$$': '$$$$',
    '': ''
  };
  return mapping[tier.toLowerCase()] || '';
};

const convertToBackendFormat = (tier: string): string => {
  const mapping: Record<string, string> = {
    '$': 'low',
    '$$': 'medium',
    '$$$': 'high',
    '$$$$': 'high'
  };
  return mapping[tier] || tier;
};

export function BusinessVerification({ onSubmit, onSkip }: BusinessVerificationProps = {}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const [formData, setFormData] = useState<BusinessVerificationData>({
    // ✅ Add these missing fields
    uen: '',
    businessName: '',
    businessCategory: '',
    description: '',
    address: '',
    open247: false,
    
    // Existing fields
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
    dateOfCreation: new Date().toISOString(),
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

  const uploadWallpaper = async (file: File): Promise<string> => {
    setUploadStatus('Uploading image...');
    
    try {
      // Step 1: Get SAS URL from backend
      const sasResponse = await fetch(
        `/api/url-generator?filename=${encodeURIComponent(file.name)}`
      );
      
      if (!sasResponse.ok) {
        throw new Error('Failed to generate upload URL');
      }

      const sasData = await sasResponse.json();
      
      // Step 2: Upload to cloud storage (Azure Blob Storage)
      const uploadResponse = await fetch(sasData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-ms-blob-type': 'BlockBlob'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }

      // Step 3: Return the public URL
      const wallpaperUrl = `https://localoco.blob.core.windows.net/images/${sasData.blobName}`;
      setUploadStatus('Image uploaded successfully');
      return wallpaperUrl;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadStatus(`Upload error: ${errorMessage}`);
      throw error;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadStatus('');
  
    try {
      let wallpaperUrl = '';
  
      // ✅ Handle image upload if file selected
      if (formData.wallpaper) {
        setUploadStatus('Generating upload URL...');
        
        // Get SAS URL
        const sasResponse = await fetch(
          `/api/url-generator?filename=${encodeURIComponent(formData.wallpaper.name)}`
        );
        
        if (!sasResponse.ok) {
          const error = await sasResponse.json();
          throw new Error(error.error || 'Failed to generate upload URL');
        }
  
        const sasData = await sasResponse.json();
        
        // Upload to Azure Blob Storage
        setUploadStatus('Uploading image to storage...');
        const uploadResponse = await fetch(sasData.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': formData.wallpaper.type,
            'x-ms-blob-type': 'BlockBlob'
          },
          body: formData.wallpaper
        });
  
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed with status ${uploadResponse.status}`);
        }
  
        // Build public URL
        wallpaperUrl = `https://localoco.blob.core.windows.net/images/${sasData.blobName}`;
        setUploadStatus('Image uploaded successfully');
      } else {
        setUploadStatus('No image selected, continuing...');
      }
      setUploadStatus('Finalizing registration...');


      const finalPayload = {
        uen: formData.uen || '',  // ✅ Add this
        businessName: formData.businessName || '',  // ✅ Add this
        businessCategory: formData.businessCategory || '',  // ✅ Add this
        description: formData.description || '',  // ✅ Add this
        address: formData.address || '',  // ✅ Add this
        open247: false,  // ✅ Add this
        openingHours: formData.operatingDays,  // ✅ Renamed
        email: formData.businessEmail,  // ✅ Renamed
        phoneNumber: formData.phone,  // ✅ Renamed
        websiteLink: formData.website,  // ✅ Renamed
        socialMediaLink: formData.socialMedia,  // ✅ Renamed
        wallpaper: wallpaperUrl,
        dateOfCreation: new Date().toISOString(),  // ✅ Add this
        priceTier: convertToBackendFormat(formData.priceTier),
        offersDelivery: formData.offersDelivery,
        offersPickup: formData.offersPickup,
        paymentOptions: formData.paymentOptions
      };
      
      const response = await fetch('/api/register-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
  
      setUploadStatus('Success! Redirecting...');
      alert('Business Registered Successfully!');
  
      if (onSubmit) {
        onSubmit(formData);
      } else {
        navigate('/map');
      }
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Registration error:', error);
      setUploadStatus(`Error: ${errorMessage}`);
      alert('Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      navigate('/map');
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

          {uploadStatus && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              {uploadStatus}
            </div>
          )}

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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
                className="bg-input-background"
              />
            </div>

            {/* Business Wallpaper */}
            <div className="space-y-2">
              <Label htmlFor="wallpaper">Business Wallpaper</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="wallpaper"
                  className="cursor-pointer px-4 py-2 bg-pink-400 hover:bg-pink-500 transition-colors rounded-md text-white"
                  >
                  Choose File
                </label>
                <Input
                  id="wallpaper"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData(prev => ({ ...prev, wallpaper: e.target.files?.[0] || null }))}
                  disabled={loading}
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
                onValueChange={(value) => {
                  const converted = convertPriceTier(value);
                  setFormData(prev => ({ 
                    ...prev, 
                    priceTier: converted
                  }));
                }}
                disabled={loading}
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
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, offersDelivery: checked as boolean }))
                  }
                  disabled={loading}
                />
                <label htmlFor="delivery" className="cursor-pointer">
                  Offers Delivery
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pickup"
                  checked={formData.offersPickup}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, offersPickup: checked as boolean }))
                  }
                  disabled={loading}
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
                      disabled={loading}
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
                onClick={handleSkip}
                disabled={loading}
                className="flex-1 text-foreground"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? 'Submitting...' : 'Submit Verification'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
