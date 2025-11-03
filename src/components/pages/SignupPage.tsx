// src/components/pages/SignupPage.tsx
import React, { useState } from 'react';
import { Store, ChevronRight, ChevronLeft, Plus, Trash2, AlertCircle } from 'lucide-react';
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
import { toast } from 'sonner';
import { createAuthClient } from "better-auth/client";
import { useAuthStore } from '../../store/authStore';

// Client setup
const baseURL = 'http://localhost:3000';
const authClient = createAuthClient({
  baseURL: baseURL
});


interface SignupPageProps {
  onSignup?: (data: any, role: UserRole) => void;
  onBack?: () => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PAYMENT_OPTIONS = ['cash','card','paynow','digital_wallets'];

interface BusinessData {
  uen: string;
  businessName: string;
  businessCategory: string;
  description: string;
  address: string;
  phoneNumber: string;
  businessEmail: string;
  websiteLink: string;
  socialMediaLink: string;
  wallpaper: File | null;
  priceTier: string;
  open247: boolean;
  openingHours: { [day: string]: { open: string; close: string } };
  offersDelivery: boolean;
  offersPickup: boolean;
  paymentOptions: string[];
}

const convertToBackendFormat = (tier: string): string => {
  const mapping: Record<string, string> = {
    '$': 'low',
    '$$': 'medium',
    '$$$': 'high',
    '$$$$': 'high'
  };
  return mapping[tier] || tier;
};

const createEmptyBusiness = (): BusinessData => ({
  uen: '',
  businessName: '',
  businessCategory: '',
  description: '',
  address: '',
  phoneNumber: '',
  businessEmail: '',
  websiteLink: '',
  socialMediaLink: '',
  wallpaper: null,
  priceTier: '',
  open247: false,
  openingHours: DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = { open: '09:00', close: '17:00' };
    return acc;
  }, {} as { [day: string]: { open: string; close: string } }),
  offersDelivery: false,
  offersPickup: false,
  paymentOptions: [],
});

export function SignupPage({ onSignup, onBack }: SignupPageProps = {}) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const navigate = useNavigate();

  const cardBgColor = isDarkMode ? '#2a2a2a' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  const [error, setError] = useState('');
  const [hasBusiness, setHasBusiness] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);
  const [useSameHours, setUseSameHours] = useState(false);
  const [defaultHours, setDefaultHours] = useState({ open: '09:00', close: '17:00' });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [businesses, setBusinesses] = useState<BusinessData[]>([createEmptyBusiness()]);

  const totalSteps = hasBusiness ? 6 : 1;
  const currentBusiness = businesses[currentBusinessIndex];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleBusinessChange = (field: string, value: any) => {
    setBusinesses(prev =>
      prev.map((business, idx) =>
        idx === currentBusinessIndex ? { ...business, [field]: value } : business
      )
    );
    setError('');
  };

  const handleOpeningHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    setBusinesses(prev =>
      prev.map((business, idx) =>
        idx === currentBusinessIndex
          ? {
              ...business,
              openingHours: {
                ...business.openingHours,
                [day]: { ...business.openingHours[day], [type]: value }
              }
            }
          : business
      )
    );
  };

  const handleDefaultHoursChange = (type: 'open' | 'close', value: string) => {
    setDefaultHours(prev => ({ ...prev, [type]: value }));
    if (useSameHours) {
      const newHours = DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = { ...defaultHours, [type]: value };
        return acc;
      }, {} as { [day: string]: { open: string; close: string } });
      setBusinesses(prev =>
        prev.map((business, idx) =>
          idx === currentBusinessIndex ? { ...business, openingHours: newHours } : business
        )
      );
    }
  };

  const handleSameHoursToggle = (checked: boolean) => {
    setUseSameHours(checked);
    if (checked) {
      const newHours = DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = { ...defaultHours };
        return acc;
      }, {} as { [day: string]: { open: string; close: string } });
      setBusinesses(prev =>
        prev.map((business, idx) =>
          idx === currentBusinessIndex ? { ...business, openingHours: newHours } : business
        )
      );
    }
  };

  const handlePaymentToggle = (payment: string) => {
    setBusinesses(prev =>
      prev.map((business, idx) =>
        idx === currentBusinessIndex
          ? {
              ...business,
              paymentOptions: business.paymentOptions.includes(payment)
                ? business.paymentOptions.filter(p => p !== payment)
                : [...business.paymentOptions, payment]
            }
          : business
      )
    );
  };

  const addBusiness = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setBusinesses(prev => [...prev, createEmptyBusiness()]);
    setCurrentBusinessIndex(businesses.length);
    setCurrentStep(2);
  };

  const removeBusiness = (index: number) => {
    if (businesses.length === 1) return;
    setBusinesses(prev => prev.filter((_, idx) => idx !== index));
    if (currentBusinessIndex >= index && currentBusinessIndex > 0) {
      setCurrentBusinessIndex(prev => prev - 1);
    }
  };

  const handleBusinessToggle = (checked: boolean) => {
    setHasBusiness(checked);
    setError('');
    if (!checked && currentStep > 1) {
      setCurrentStep(1);
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      return true;
    }

    if (!hasBusiness) return true;

    switch (step) {
      case 2:
        if (!currentBusiness.uen || !currentBusiness.businessName || !currentBusiness.businessCategory || !currentBusiness.description || !currentBusiness.address) {
          setError('Please fill in all required fields');
          return false;
        }
        return true;
      case 3:
        if (!currentBusiness.businessEmail || !currentBusiness.phoneNumber) {
          setError('Please fill in all required contact fields');
          return false;
        }
        if (!currentBusiness.businessEmail.includes('@')) {
          setError('Please enter a valid business email');
          return false;
        }
        if (!currentBusiness.wallpaper) {
          setError('Please upload a business photo');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
    e.stopPropagation();
  
    if (currentStep !== totalSteps) {
      return;
    }
  
    if (!validateStep(currentStep)) {
      return;
    }
  
    setIsLoading(true);
    setUploadStatus('');
  
    try {
      // STEP 1: Register user FIRST (must complete before businesses)
      const userPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };
  
      
      const { data: userData, error: userError } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        callbackURL: baseURL
      });

      if (userError) {
        throw new Error('User registration failed: ' + userError.message);
      }

      console.log('✅ User registered:', userData);
      console.log('📋 Registered user ID:', userData?.user?.id);
      console.log('📧 Registered user email:', userData?.user?.email);

      // If autoSignIn didn't work, manually sign in
      if (!userData?.session) {
        console.log('⚠️ No session after signup, manually signing in...');

        // IMPORTANT: Manually sign in after signup to ensure session is created
        const { data: signInData, error: signInError } = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
          callbackURL: baseURL
        });

        if (signInError) {
          console.error('❌ Sign in error:', signInError);
          throw new Error('Sign in after registration failed: ' + signInError.message);
        }

        console.log('✅ Signed in manually:', signInData);
      }

      // Get userId and accessToken from the signup/signin response
      const userId = userData?.user?.id;
      const accessToken = userData?.session?.token;

      if (!userId || !accessToken) {
        throw new Error('No session created after signup. Please try logging in manually.');
      }

      console.log('✅ Final session userId:', userId);
      console.log('✅ Final session token:', accessToken);

      toast.success('Account created and logged in!');
  
      // STEP 2: NOW register all businesses concurrently
      if (hasBusiness) {
        // Upload all wallpapers concurrently
        const businessRegistrations = await Promise.all(
          businesses.map(async (business) => {
            let wallpaperUrl = '';
  
            if (business.wallpaper) {
              wallpaperUrl = await uploadWallpaper(business.wallpaper);
            }

            return {
              ownerID: userId, // Link business to user
              uen: business.uen,
              businessName: business.businessName,
              businessCategory: business.businessCategory,
              description: business.description,
              address: business.address,
              phoneNumber: business.phoneNumber,
              email: business.businessEmail,
              websiteLink: business.websiteLink,
              socialMediaLink: business.socialMediaLink,
              wallpaper: wallpaperUrl,
              dateOfCreation: new Date().toISOString().slice(0, 10),
              priceTier: convertToBackendFormat(business.priceTier),
              open247: business.open247,
              openingHours: business.openingHours, // ✅ Send as object, NOT JSON.stringify()
              offersDelivery: business.offersDelivery,
              offersPickup: business.offersPickup,
              paymentOptions: business.paymentOptions, // ✅ Send as array, NOT JSON.stringify()
              password: formData.password,
            };
          })
        );
  
        // Send all business registrations CONCURRENTLY
        const results = await Promise.allSettled(
          businessRegistrations.map(payload =>
            fetch('/api/register-business', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }).then(res => res.json())
          )
        );
  
        // Check results
        const fulfilled = results.filter(r => r.status === 'fulfilled');
        const successCount = fulfilled.filter(r => r.value?.success).length;
  
        if (successCount !== businesses.length) {
          throw new Error(
            `Registered user + ${successCount}/${businesses.length} businesses`
          );
        }
  
        toast.success('All businesses registered successfully!');
      }
      
  
      const store = useAuthStore.getState();
      store.login(userId, 'user', accessToken);

      console.log('🎯 Auth store updated with:', {
        userId,
        role: 'user',
        token: accessToken,
        isAuthenticated: store.isAuthenticated
      });

      setTimeout(() => {
        navigate('/map');
      }, 100);
      
      

      // // STEP 3: Login and redirect
      // if (onSignup) {
      //   // onSignup({ ...formData, businesses, userId }, 'user');
      // } else {
      //   navigate('/map');
      // }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError('Error signing up: ' + errorMessage);
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
    if (!hasBusiness) return null;

    const steps = ['Account', 'Basic Info', 'Contact', 'Hours', 'Details', 'Review'];

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

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-3">
          <h3 style={{ color: textColor }}>Create Your Account</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
                className="bg-input-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
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
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
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

          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasBusiness"
                checked={hasBusiness}
                onCheckedChange={value => setHasBusiness(!!value)}
                className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                style={{ 
                  borderColor: isDarkMode ? '#ffffff' : '#000000',
                  backgroundColor: hasBusiness ? undefined : 'transparent'
                }}
              />
              <label htmlFor="hasBusiness" className="cursor-pointer text-foreground">
                I own a business
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Register your business to appear in LocalLoco directory
            </p>
          </div>
        </div>
      );
    }

    if (currentStep === 2 && hasBusiness) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 style={{ color: textColor }}>Business {currentBusinessIndex + 1} of {businesses.length} - Basic Information</h3>
            {businesses.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBusiness(currentBusinessIndex)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="uen" className="text-foreground">UEN</Label>
            <Input
              id="uen"
              placeholder="Unique Entity Number"
              value={currentBusiness.uen}
              onChange={(e) => handleBusinessChange('uen', e.target.value)}
              required
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-foreground">Business Name</Label>
            <Input
              id="businessName"
              placeholder="Business name"
              value={currentBusiness.businessName}
              onChange={(e) => handleBusinessChange('businessName', e.target.value)}
              required
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessCategory" className="text-foreground">Business Category</Label>
            <Select
              value={currentBusiness.businessCategory}
              onValueChange={(value: string) => handleBusinessChange('businessCategory', value)}
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
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <textarea
              id="description"
              placeholder="Tell customers about your business..."
              value={currentBusiness.description}
              onChange={(e) => handleBusinessChange('description', e.target.value)}
              required
              style={{ 
                backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f3f5',
                color: textColor
              }}
              className="w-full p-3 rounded-md border border-input focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-foreground">Business Address</Label>
            <Input
              id="address"
              placeholder="Street Address, City, Postal Code"
              value={currentBusiness.address}
              onChange={(e) => handleBusinessChange('address', e.target.value)}
              required
              className="bg-input-background"
            />
          </div>
        </div>
      );
    }

    if (currentStep === 3 && hasBusiness) {
      return (
        <div className="space-y-3">
          <h3 style={{ color: textColor }}>Business {currentBusinessIndex + 1} - Contact Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="businessEmail" className="text-foreground">Business Email</Label>
            <Input
              id="businessEmail"
              type="email"
              placeholder="contact@yourbusiness.com"
              value={currentBusiness.businessEmail}
              onChange={(e) => handleBusinessChange('businessEmail', e.target.value)}
              required
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-foreground">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+65 1234 5678"
              value={currentBusiness.phoneNumber}
              onChange={(e) => handleBusinessChange('phoneNumber', e.target.value)}
              required
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteLink" className="text-foreground">Website</Label>
            <Input
              id="websiteLink"
              type="url"
              placeholder="https://www.yourbusiness.com"
              value={currentBusiness.websiteLink}
              onChange={(e) => handleBusinessChange('websiteLink', e.target.value)}
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialMediaLink" className="text-foreground">Social Media</Label>
            <Input
              id="socialMediaLink"
              type="url"
              placeholder="https://instagram.com/yourbusiness"
              value={currentBusiness.socialMediaLink}
              onChange={(e) => handleBusinessChange('socialMediaLink', e.target.value)}
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallpaper" className="text-foreground">Business Photo *</Label>
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
                onChange={(e) => handleBusinessChange('wallpaper', e.target.files?.[0] || null)}
                disabled={isLoading}
                className="hidden"
                required
              />
              <span className="text-sm text-muted-foreground">
                {currentBusiness.wallpaper ? currentBusiness.wallpaper.name : 'No file chosen'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 4 && hasBusiness) {
      return (
        <div className="space-y-3">
          <h3 style={{ color: textColor }}>Business {currentBusinessIndex + 1} - Operating Hours</h3>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="open247"
              checked={currentBusiness.open247}
              onCheckedChange={(checked: boolean) => handleBusinessChange('open247', checked)}
              className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              style={{ 
                borderColor: isDarkMode ? '#ffffff' : '#000000',
                backgroundColor: currentBusiness.open247 ? undefined : 'transparent'
              }}
            />
            <label htmlFor="open247" className="cursor-pointer text-foreground">
              Open 24/7
            </label>
          </div>

          {!currentBusiness.open247 && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sameHours"
                  checked={useSameHours}
                  onCheckedChange={handleSameHoursToggle}
                  className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  style={{ 
                    borderColor: isDarkMode ? '#ffffff' : '#000000',
                    backgroundColor: useSameHours ? undefined : 'transparent'
                  }}
                />
                <label htmlFor="sameHours" className="cursor-pointer text-sm text-foreground">
                  Same hours for all days
                </label>
              </div>

              {useSameHours ? (
                <div 
                  className="p-4 rounded-md space-y-2 border border-input"
                  style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f3f5' }}
                >
                  <Label className="text-foreground">Default Hours (All Days)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="time"
                      value={defaultHours.open}
                      onChange={e => handleDefaultHoursChange('open', e.target.value)}
                      disabled={isLoading}
                      style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
                      className="flex-1"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={defaultHours.close}
                      onChange={e => handleDefaultHoursChange('close', e.target.value)}
                      disabled={isLoading}
                      style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
                      className="flex-1"
                    />
                  </div>
                </div>
              ) : (
                <div 
                  className="p-4 rounded-md max-h-80 overflow-y-auto border border-input"
                  style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f3f5' }}
                >
                  <div className="space-y-3">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-medium text-foreground">{day}</span>
                        <Input
                          type="time"
                          value={currentBusiness.openingHours[day].open}
                          onChange={e => handleOpeningHoursChange(day, 'open', e.target.value)}
                          disabled={isLoading}
                          style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground text-sm">to</span>
                        <Input
                          type="time"
                          value={currentBusiness.openingHours[day].close}
                          onChange={e => handleOpeningHoursChange(day, 'close', e.target.value)}
                          disabled={isLoading}
                          style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
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
    }

    if (currentStep === 5 && hasBusiness) {
      return (
        <div className="space-y-3">
          <h3 style={{ color: textColor }}>Business {currentBusinessIndex + 1} - Business Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="priceTier" className="text-foreground">Price Tier</Label>
            <Select
              value={currentBusiness.priceTier}
              onValueChange={(value: string) => handleBusinessChange('priceTier', value)}
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
            <Label className="text-foreground">Service Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delivery"
                  checked={currentBusiness.offersDelivery}
                  onCheckedChange={(checked: boolean) => handleBusinessChange('offersDelivery', checked)}
                  disabled={isLoading}
                  className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  style={{ 
                    borderColor: isDarkMode ? '#ffffff' : '#000000',
                    backgroundColor: currentBusiness.offersDelivery ? undefined : 'transparent'
                  }}
                />
                <label htmlFor="delivery" className="cursor-pointer text-foreground">
                  Offers Delivery
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pickup"
                  checked={currentBusiness.offersPickup}
                  onCheckedChange={(checked: boolean) => handleBusinessChange('offersPickup', checked)}
                  disabled={isLoading}
                  className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  style={{ 
                    borderColor: isDarkMode ? '#ffffff' : '#000000',
                    backgroundColor: currentBusiness.offersPickup ? undefined : 'transparent'
                  }}
                />
                <label htmlFor="pickup" className="cursor-pointer text-foreground">
                  Offers Pickup
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Payment Options</Label>
            <div 
              className="rounded-md p-4 border border-input"
              style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f3f5' }}
            >
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map(payment => (
                  <div key={payment} className="flex items-center space-x-2">
                    <Checkbox
                      id={payment}
                      checked={currentBusiness.paymentOptions.includes(payment)}
                      onCheckedChange={() => handlePaymentToggle(payment)}
                      disabled={isLoading}
                      className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      style={{ 
                        borderColor: isDarkMode ? '#ffffff' : '#000000',
                        backgroundColor: currentBusiness.paymentOptions.includes(payment) ? undefined : 'transparent'
                      }}
                    />
                    <label htmlFor={payment} className="text-sm cursor-pointer flex-1 text-foreground">
                      {payment}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 6 && hasBusiness) {
      return (
        <div className="space-y-3">
          <h3 style={{ color: textColor }}>Review & Submit</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-900">
              <strong>Almost done!</strong> Review your information and click "Create Account" to complete your registration.
            </p>
          </div>

          <div className="bg-muted/30 rounded-md p-4 space-y-3 max-h-96 overflow-y-auto">
            <div>
              <p className="text-sm font-medium text-foreground">Account Information</p>
              <p className="text-sm text-muted-foreground">
                {formData.firstName} {formData.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
            </div>
            
            {businesses.map((business, index) => (
              <div key={index} className="border-t pt-3">
                <p className="text-sm font-medium text-foreground">Business {index + 1}: {business.businessName || 'Unnamed Business'}</p>
                <p className="text-sm text-muted-foreground">Category: {business.businessCategory || 'Not set'}</p>
                <p className="text-sm text-muted-foreground">Address: {business.address || 'Not set'}</p>
                <p className="text-sm text-muted-foreground">
                  {business.businessEmail || 'No email'} • {business.phoneNumber || 'No phone'}
                </p>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={addBusiness}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Business
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`min-h-screen relative ${!isDarkMode ? 'bg-gradient-to-br from-pink-50 via-pink-100 to-orange-50' : ''}`}
      style={isDarkMode ? { backgroundColor: '#3a3a3a' } : {}}
    >
      {!isDarkMode && (
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
      )}

      <header className="shadow-md relative z-10 bg-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">LocalLoco</h1>
              <p className="text-sm opacity-90">
                Discover and support local businesses in your community
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4 relative z-10">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="rounded-lg shadow-lg p-8" style={{ backgroundColor: cardBgColor, color: textColor }}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary">Create Account</h2>
              <p className="text-sm mt-1 text-muted-foreground">Join LocalLoco today</p>
            </div>

            {uploadStatus && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-center text-blue-700">
                {uploadStatus}
              </div>
            )}

            {renderStepIndicator()}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {hasBusiness && currentStep >= 2 && currentStep <= 5 && businesses.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {businesses.map((business, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentBusinessIndex(index)}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      currentBusinessIndex === index
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {business.businessName || `Business ${index + 1}`}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {renderStep()}
            </div>

            <div className="flex gap-4 mt-6 pt-4 border-t">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}

              {currentStep === totalSteps ? (
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
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

            {/* Login Link */}
            <div className="text-center pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Already have an account?{' '}
              </span>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => navigate('/login')}
              >
                Sign in here
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={handleBack}
              >
                Back to home
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}