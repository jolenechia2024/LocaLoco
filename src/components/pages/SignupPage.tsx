import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { UserRole } from '../../types/auth';
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

interface SignupPageProps {
  onSignup: (data: any, role: UserRole) => void;
  onBack: () => void;
  isDarkMode?: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PAYMENT_OPTIONS = ['Cash', 'Credit/Debit Card', 'PayNow', 'Digital Wallets (Apple/Google/Samsung/GrabPay)'];

export function SignupPage({ onSignup, onBack, isDarkMode = true }: SignupPageProps) {
  const [role, setRole] = useState<UserRole>('user');
  const headerBgColor = isDarkMode ? '#3a3a3a' : '#ffffff';
  const headerTextColor = isDarkMode ? '#ffffff' : '#000000';
  const [formData, setFormData] = useState({
    // User fields
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Business-specific fields
    businessName: '',
    address: '',
    phone: '',
    operatingDays: [] as string[],
    businessEmail: '',
    website: '',
    socialMedia: '',
    wallpaper: null as File | null,
    priceTier: '',
    offersDelivery: false,
    offersPickup: false,
    paymentOptions: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    onSignup(formData, role);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleSignup = async (data: any, role: UserRole) => {
    // Prepare FormData if business, else JSON
    let payload;
    let options;
  
    if (role === 'business') {
      payload = new FormData();
  
      // Append business fields from data
      for (const [key, value] of Object.entries(data)) {
        if (key === 'wallpaper' && value) {
          payload.append(key, value as File);
        } else if (Array.isArray(value)) {
          payload.append(key, JSON.stringify(value));
        } else {
          payload.append(key, value as string);
        }
      }
      payload.append('role', role);
      payload.append('mode', 'signup');
  
      options = { method: 'POST', body: payload };
    } else {
      payload = {
        ...data,
        role,
        mode: 'signup'
      };
      options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      };
    }
  
    try {
      const response = await fetch('http://localhost/final%20proj/IS216_WAD2_Grp3/backend/utils/processLogin.php', options);
      const result = await response.json();
      if (result.success) {
        alert('Signup successful!');
        // Redirect or UI update
      } else {
        alert('Signup failed: ' + (result.errors || 'Unknown error'));
      }
    } catch (error) {
      alert('Error signing up: ' + error.message);
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-orange-50 relative">
      {/* Background pattern */}
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
              <h1 className="text-xl">LocalLoco</h1>
              <p className="text-sm opacity-90">
                Discover and support local businesses in your community - or nearby you!
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Signup Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4 relative z-10">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <h2 className="text-center">Create Account</h2>

            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="bg-primary/80 text-white border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === 'user' ? (
              // User Signup Form
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First Name"
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
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                      className="bg-input-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
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
                    placeholder="Create password"
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
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>
              </>
            ) : (
              // Business Signup Form
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Business Name"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Business Address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    placeholder="Business Email"
                    value={formData.businessEmail}
                    onChange={(e) => handleChange('businessEmail', e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website Link (https://)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="Website Link (https://)"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialMedia">Social Media Link</Label>
                  <Input
                    id="socialMedia"
                    type="url"
                    placeholder="Social Media Link"
                    value={formData.socialMedia}
                    onChange={(e) => handleChange('socialMedia', e.target.value)}
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
                      onChange={(e) => handleChange('wallpaper', e.target.files?.[0] || null)}
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
                    onValueChange={(value) => handleChange('priceTier', value)}
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
                      onCheckedChange={(checked) => handleChange('offersDelivery', checked as boolean)}
                    />
                    <label htmlFor="delivery" className="cursor-pointer">
                      Offers Delivery
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pickup"
                      checked={formData.offersPickup}
                      onCheckedChange={(checked) => handleChange('offersPickup', checked as boolean)}
                    />
                    <label htmlFor="pickup" className="cursor-pointer">
                      Offers Pickup
                    </label>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-4">
                  <Label>Payment Options</Label>
                  <div className="bg-input-background rounded-md p-4">
                    <div className="space-y-3">
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
                  <p className="text-xs text-muted-foreground">
                    Hold Ctrl (Cmd on Mac) to select multiple options.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
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
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Sign Up
            </Button>

            <div className="text-center pt-4">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={onBack}
              >
                Back to welcome screen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
