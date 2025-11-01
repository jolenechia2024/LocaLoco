import React, { useState } from 'react';
import { Store, ChevronRight, ChevronLeft } from 'lucide-react';
import { UserRole } from '../../types/auth';
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
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

interface SignupPageProps {
  onSignup?: (data: any, role: UserRole) => void;
  onBack?: () => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PAYMENT_OPTIONS = ['Cash', 'Credit/Debit Card', 'PayNow', 'Digital Wallets (Apple/Google/Samsung/GrabPay)'];

const convertToBackendFormat = (tier: string): string => {
  const mapping: Record<string, string> = {
    '$': 'low',
    '$$': 'medium',
    '$$$': 'high',
    '$$$$': 'high'
  };
  return mapping[tier] || tier;
};

export function SignupPage({ onSignup, onBack }: SignupPageProps = {}) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [role, setRole] = useState<UserRole>('user');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const [useSameHours, setUseSameHours] = useState(false);
  const [defaultHours, setDefaultHours] = useState({ open: '09:00', close: '17:00' });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    uen: '',
    businessName: '',
    businessCategory: '',
    description: '',
    address: '',
    phoneNumber: '',
    businessEmail: '',
    websiteLink: '',
    socialMediaLink: '',
    wallpaper: null as File | null,
    priceTier: '',
    open247: false,
    openingHours: DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = { open: '09:00', close: '17:00' };
      return acc;
    }, {} as { [day: string]: { open: string; close: string } }),
    offersDelivery: false,
    offersPickup: false,
    paymentOptions: [] as string[],
  });

  const totalSteps = role === 'business' ? 5 : 1;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpeningHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [type]: value
        }
      }
    }));
  };

  const handleDefaultHoursChange = (type: 'open' | 'close', value: string) => {
    setDefaultHours(prev => ({ ...prev, [type]: value }));
    if (useSameHours) {
      const newHours = DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = { ...defaultHours, [type]: value };
        return acc;
      }, {} as { [day: string]: { open: string; close: string } });
      setFormData(prev => ({ ...prev, openingHours: newHours }));
    }
  };

  const handleSameHoursToggle = (checked: boolean) => {
    setUseSameHours(checked);
    if (checked) {
      const newHours = DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = { ...defaultHours };
        return acc;
      }, {} as { [day: string]: { open: string; close: string } });
      setFormData(prev => ({ ...prev, openingHours: newHours }));
    }
  };

  const handlePaymentToggle = (payment: string) => {
    setFormData(prev => ({
      ...prev,
      paymentOptions: prev.paymentOptions.includes(payment)
        ? prev.paymentOptions.filter(p => p !== payment)
        : [...prev.paymentOptions, payment]
    }));
  };

  const validateStep = (step: number): boolean => {
    if (role === 'user') {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      return true;
    }

    switch (step) {
      case 1:
        if (!formData.uen || !formData.businessName || !formData.businessCategory || !formData.description || !formData.address) {
          toast.error('Please fill in all required fields');
          return false;
        }
        return true;
      case 2:
        if (!formData.businessEmail || !formData.phoneNumber) {
          toast.error('Please fill in all required contact fields');
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        if (!formData.password || !formData.confirmPassword) {
          toast.error('Please fill in password fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const uploadWallpaper = async (file: File): Promise<string> => {
    setUploadStatus('Uploading image...');
    
    try {
      const sasResponse = await fetch(
        `/api/url-generator?filename=${encodeURIComponent(file.name)}`
      );
      
      if (!sasResponse.ok) {
        throw new Error('Failed to generate upload URL');
      }

      const sasData = await sasResponse.json();
      
      setUploadStatus('Uploading to storage...');
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
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    setUploadStatus('');

    try {
      if (role === 'business') {
        let wallpaperUrl = '';

        if (formData.wallpaper) {
          wallpaperUrl = await uploadWallpaper(formData.wallpaper);
        }

        const businessPayload = {
          uen: formData.uen,
          businessName: formData.businessName,
          businessCategory: formData.businessCategory,
          description: formData.description,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          email: formData.businessEmail,
          websiteLink: formData.websiteLink,
          socialMediaLink: formData.socialMediaLink,
          wallpaper: wallpaperUrl,
          dateOfCreation: new Date().toISOString().slice(0, 10),
          priceTier: convertToBackendFormat(formData.priceTier),
          open247: formData.open247,
          openingHours: formData.openingHours,
          offersDelivery: formData.offersDelivery,
          offersPickup: formData.offersPickup,
          paymentOptions: formData.paymentOptions,
          password: formData.password,
          role,
          mode: 'signup'
        };

        const response = await fetch('/api/register-business', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(businessPayload)
        });

        const result = await response.json();

        if (result.success || response.ok) {
          toast.success('Business registered successfully!');
          if (onSignup) {
            onSignup(formData, role);
          } else {
            login(result.userId || 'business-1', role);
            navigate('/map');
          }
        } else {
          toast.error('Signup failed: ' + (result.message || 'Unknown error'));
        }
      } else {
        const userPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role,
          mode: 'signup'
        };

        const response = await fetch('/api/register-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userPayload)
        });

        const result = await response.json();

        if (result.success || response.ok) {
          toast.success('Account created successfully!');
          if (onSignup) {
            onSignup(formData, role);
          } else {
            login(result.userId || 'user-1', role);
            navigate('/map');
          }
        } else {
          toast.error('Signup failed: ' + (result.message || 'Unknown error'));
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Error signing up: ' + errorMessage);
    } finally {
      setIsLoading(false);
      setUploadStatus('');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const renderStepIndicator = () => {
    if (role === 'user') return null;

    const steps = [
      'Basic Info',
      'Contact',
      'Hours',
      'Details',
      'Security'
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    index + 1 === currentStep
                      ? 'bg-primary text-white'
                      : index + 1 < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1 text-gray-600">{step}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderUserForm = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
            className="bg-input-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
            className="bg-input-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@example.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
          className="bg-input-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          required
          className="bg-input-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          required
          className="bg-input-background"
        />
      </div>
    </div>
  );

  const renderBusinessStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            <h3>Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="uen">UEN (Unique Entity Number)</Label>
              <Input
                id="uen"
                placeholder="Enter UEN"
                value={formData.uen}
                onChange={(e) => handleChange('uen', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Your Business Name"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessCategory">Business Category</Label>
              <Select
                value={formData.businessCategory}
                onValueChange={(value: string) => handleChange('businessCategory', value)}
              >
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fnb">F&B</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="health_wellness">Health/Wellness</SelectItem>
                  <SelectItem value="professional_services">Professional Services</SelectItem>
                  <SelectItem value="home_living">Home and Living</SelectItem>
                </SelectContent>
              </Select>
            </div>


            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Tell customers about your business..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                className="w-full bg-input-background p-3 rounded-md border border-input focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                placeholder="Street Address, City, Postal Code"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <h3>Contact Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input
                id="businessEmail"
                type="email"
                placeholder="contact@yourbusiness.com"
                value={formData.businessEmail}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+65 1234 5678"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteLink">Website</Label>
              <Input
                id="websiteLink"
                type="url"
                placeholder="https://www.yourbusiness.com"
                value={formData.websiteLink}
                onChange={(e) => handleChange('websiteLink', e.target.value)}
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialMediaLink">Social Media</Label>
              <Input
                id="socialMediaLink"
                type="url"
                placeholder="https://instagram.com/yourbusiness"
                value={formData.socialMediaLink}
                onChange={(e) => handleChange('socialMediaLink', e.target.value)}
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallpaper">Business Photo</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="wallpaper"
                  className="cursor-pointer px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
                  >
                  Choose File
                </label>
                <Input
                  id="wallpaper"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange('wallpaper', e.target.files?.[0] || null)}
                  disabled={isLoading}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground">
                  {formData.wallpaper ? formData.wallpaper.name : 'No file chosen'}
                </span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <h3>Operating Hours</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="open247"
                checked={formData.open247}
                onCheckedChange={(checked: boolean) => handleChange('open247', checked)}
              />
              <label htmlFor="open247" className="cursor-pointer">
                Open 24/7
              </label>
            </div>

            {!formData.open247 && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameHours"
                    checked={useSameHours}
                    onCheckedChange={handleSameHoursToggle}
                  />
                  <label htmlFor="sameHours" className="cursor-pointer text-sm">
                    Same hours for all days
                  </label>
                </div>

                {useSameHours ? (
                  <div className="bg-input-background p-4 rounded-md space-y-2">
                    <Label>Default Hours (All Days)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="time"
                        value={defaultHours.open}
                        onChange={e => handleDefaultHoursChange('open', e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={defaultHours.close}
                        onChange={e => handleDefaultHoursChange('close', e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-input-background p-4 rounded-md max-h-80 overflow-y-auto">
                    <div className="space-y-3">
                      {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="flex items-center gap-3">
                          <span className="w-24 text-sm font-medium">{day}</span>
                          <Input
                            type="time"
                            value={formData.openingHours[day].open}
                            onChange={e => handleOpeningHoursChange(day, 'open', e.target.value)}
                            disabled={isLoading}
                            className="flex-1"
                          />
                          <span className="text-muted-foreground text-sm">to</span>
                          <Input
                            type="time"
                            value={formData.openingHours[day].close}
                            onChange={e => handleOpeningHoursChange(day, 'close', e.target.value)}
                            disabled={isLoading}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <h3>Business Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="priceTier">Price Tier</Label>
              <Select
                value={formData.priceTier}
                onValueChange={(value: string) => handleChange('priceTier', value)}
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

            <div className="space-y-3">
              <Label>Service Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="delivery"
                    checked={formData.offersDelivery}
                    onCheckedChange={(checked: boolean) => handleChange('offersDelivery', checked)}
                    disabled={isLoading}
                  />
                  <label htmlFor="delivery" className="cursor-pointer">
                    Offers Delivery
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pickup"
                    checked={formData.offersPickup}
                    onCheckedChange={(checked: boolean) => handleChange('offersPickup', checked)}
                    disabled={isLoading}
                  />
                  <label htmlFor="pickup" className="cursor-pointer">
                    Offers Pickup
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Payment Options</Label>
              <div className="bg-input-background rounded-md p-4">
                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map(payment => (
                    <div key={payment} className="flex items-center space-x-2">
                      <Checkbox
                        id={payment}
                        checked={formData.paymentOptions.includes(payment)}
                        onCheckedChange={() => handlePaymentToggle(payment)}
                        disabled={isLoading}
                      />
                      <label htmlFor={payment} className="text-sm cursor-pointer flex-1">
                        {payment}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-3">
            <h3>Account Security</h3>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
              <p className="text-sm text-blue-900">
                <strong>Almost done!</strong> Review your information and click "Create Account" to complete your registration.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-orange-50 relative">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFA1A3" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <header className="text-white shadow-md relative z-10" style={{ backgroundColor: '#3a3a3a' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">LocalLoco</h1>
              <p className="text-sm opacity-90">
                Discover and support local businesses in your community - or nearby you!
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4 relative z-10">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary">Create Account</h2>
              <p className="text-sm text-gray-600 mt-1">Join LocalLoco today</p>
            </div>

            {/* Upload Status */}
            {uploadStatus && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-center text-blue-700">
                {uploadStatus}
              </div>
            )}

            {/* Account Type Selection */}
            {(role === 'user' || currentStep === 1) && (
              <div className="space-y-2 mb-6">
                <Label htmlFor="role">Account Type</Label>
                <Select 
                  value={role} 
                  onValueChange={(value: string) => {
                    setRole(value as UserRole);
                    setCurrentStep(1);
                  }}
                >
                  <SelectTrigger className="bg-primary/80 text-white border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User Account</SelectItem>
                    <SelectItem value="business">Business Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Form Content */}
            <div className="space-y-6 py-2">
              {role === 'user' ? renderUserForm() : renderBusinessStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6 pt-4 border-t">
              {role === 'business' && currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className="flex-1 text-foreground"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}

              {role === 'user' || currentStep === totalSteps ? (
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
                  onClick={handleSubmit}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Back Link */}
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleBack}
              >
                ← Back to welcome screen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
