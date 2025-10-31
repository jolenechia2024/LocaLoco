import { useState } from 'react';
import { Star, MapPin, Phone, Globe, Clock, ArrowLeft, Bookmark, MessageSquare } from 'lucide-react';
import { Business, Review } from '../types/business';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ReviewCard } from './ReviewCard';
import { MapPlaceholder } from './MapPlaceholder';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BusinessDetailProps {
  business: Business;
  reviews: Review[];
  isBookmarked: boolean;
  onBookmarkToggle: (businessId: string) => void;
  onBack: () => void;
  onWriteReview?: (business: Business) => void;
  isDarkMode?: boolean;
}

export function BusinessDetail({
  business,
  reviews,
  isBookmarked,
  onBookmarkToggle,
  onBack,
  onWriteReview,
  isDarkMode = true,
}: BusinessDetailProps) {
    const isDarkMode = useThemeStore(state => state.isDarkMode);

  const [selectedTab, setSelectedTab] = useState('overview');
  
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-400/50 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const businessReviews = reviews.filter(review => review.businessId === business.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Button>
      </div>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="relative">
        <ImageWithFallback
            src={`https://localoco.blob.core.windows.net/images/${business.image}`}
            alt={business.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-start justify-between text-white">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{business.name}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {business.category}
                  </Badge>
                  <span className="text-sm">{business.priceRange}</span>
                </div>
                {business.rating !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(business.rating)}</div>
                    <span className="text-sm">
                      {business.rating} ({business.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant={isBookmarked ? "default" : "secondary"}
                size="sm"
                onClick={() => onBookmarkToggle(business.id)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    isBookmarked ? 'fill-white' : 'fill-none'
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({businessReviews.length})
          </TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Business Info */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">{business.description}</p>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{business.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{business.phone}</span>
                  </div>
                  
                  {business.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#FFA1A3] hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="w-5 h-5" />
                  Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(business.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-foreground capitalize">{day}</span>
                      <span className="text-foreground">
                        {typeof hours === 'object' && hours && 'open' in hours && 'close' in hours
                          ? `${hours.open} - ${hours.close}`
                          : String(hours)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" style={{ color: textColor }} />
              <h3 style={{ color: textColor }}>Customer Reviews</h3>
            </div>
            <Button 
              size="sm" 
              className="bg-[#FFA1A3] hover:bg-[#FF8A8C] text-white"
              onClick={() => onWriteReview?.(business)}
            >
              Write Review
            </Button>
          </div>
          
          <div className="space-y-4">
            {businessReviews.length > 0 ? (
              businessReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground">No reviews yet. Be the first to review!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="location">
          <MapPlaceholder business={business} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
