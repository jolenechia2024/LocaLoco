import { Star, MapPin, Phone, Clock, Bookmark, TrendingUp } from 'lucide-react';
import { Business } from '../types/business';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { checkBusinessOpenStatus, getCategoryDisplayName } from '../utils/businessUtils';

interface BusinessCardProps {
  business: Business;
  isBookmarked: boolean;
  onBookmarkToggle: (businessId: string) => void;
  onViewDetails: (business: Business) => void;
  isDarkMode?: boolean;
}

export function BusinessCard({
  business,
  isBookmarked,
  onBookmarkToggle,
  onViewDetails,
  isDarkMode = false,
}: BusinessCardProps) {
  const cardBgColor = isDarkMode ? '#2a2a2a' : '#ffffff';
  const textColor = isDarkMode ? 'text-white' : 'text-black';
  const mutedTextColor = isDarkMode ? 'text-gray-400' : 'text-muted-foreground';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-400/50 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const openStatus = checkBusinessOpenStatus(business);

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-200 ${borderColor}`} style={{ backgroundColor: cardBgColor }}>
      <CardHeader className="p-0">
        <div className="relative">
          <ImageWithFallback
            src={business.image}
            alt={business.name}
            className="w-full h-48 object-cover"
          />
          <Button
            variant={isBookmarked ? "default" : "secondary"}
            size="sm"
            className="absolute top-2 right-2 p-2"
            onClick={() => onBookmarkToggle(business.id)}
          >
            <Bookmark
              className={`w-4 h-4 ${
                isBookmarked ? 'fill-white' : 'fill-none'
              }`}
            />
          </Button>
          <div className="absolute bottom-2 left-2 space-y-1">
            <Badge variant="secondary" className="bg-white/90 text-black">
              {getCategoryDisplayName(business.category)}
            </Badge>
            {business.isPopular && (
              <Badge variant="default" className="bg-red-500 text-white flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Popular
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className={`text-lg font-semibold line-clamp-1 ${textColor}`}>{business.name}</h3>
            <div className="flex items-center gap-1 text-sm">
              {business.rating !== undefined && (
                <>
                  <div className="flex">{renderStars(business.rating)}</div>
                  <span className={mutedTextColor}>({business.reviewCount})</span>
                </>
              )}
            </div>
          </div>
          
          <p className={`text-sm ${mutedTextColor} line-clamp-2`}>
            {business.description}
          </p>
          
          <div className={`flex items-center gap-1 text-sm ${mutedTextColor}`}>
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{business.address}</span>
          </div>
          
          <div className={`flex items-center gap-1 text-sm ${mutedTextColor}`}>
            <Phone className="w-4 h-4" />
            <span>{business.phone}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Clock className="w-4 h-4" />
              <span className={`${
                openStatus.isOpen 
                  ? openStatus.closingSoon 
                    ? 'text-orange-600' 
                    : 'text-green-600'
                  : 'text-red-600'
              }`}>
                {openStatus.isOpen ? 'Open' : 'Closed'}
              </span>
              <span className={`${mutedTextColor} text-xs`}>
                • {openStatus.nextChange}
              </span>
            </div>
            <span className={`text-sm font-medium ${textColor}`}>{business.priceRange}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onViewDetails(business)}
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
