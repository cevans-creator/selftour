"use client";

import Link from "next/link";
import { Home, Wifi, WifiOff, BatteryLow, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    status: string;
    bedrooms: number | null;
    bathrooms: string | null;
    imageUrls: string[];
    seamDeviceId: string | null;
  };
  lockStatus?: {
    online: boolean;
    locked: boolean | null;
    battery: number | null;
  } | null;
  upcomingTourCount?: number;
  communityName?: string;
}

export function PropertyCard({
  property,
  lockStatus,
  upcomingTourCount = 0,
  communityName,
}: PropertyCardProps) {
  const hasLock = !!property.seamDeviceId;

  const LockIcon = lockStatus?.online ? Wifi : WifiOff;
  const lockColor = !hasLock
    ? "text-muted-foreground"
    : lockStatus?.online
      ? "text-green-600"
      : "text-red-500";

  const isLowBattery =
    lockStatus?.battery !== null &&
    lockStatus?.battery !== undefined &&
    lockStatus.battery < 0.2;

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md">
        {/* Property image or placeholder */}
        <div className="relative h-40 overflow-hidden rounded-t-lg bg-muted">
          {property.imageUrls[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.imageUrls[0]}
              alt={property.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Home className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute left-3 top-3">
            <Badge
              variant={
                property.status === "active"
                  ? "success"
                  : property.status === "pending"
                    ? "warning"
                    : "gray"
              }
            >
              {property.status}
            </Badge>
          </div>

          {/* Lock status indicator */}
          {hasLock && (
            <div className={cn("absolute right-3 top-3 rounded-full bg-black/60 p-1.5", lockColor)}>
              <LockIcon className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {communityName && (
                <p className="mb-0.5 text-xs text-muted-foreground">{communityName}</p>
              )}
              <h3 className="font-semibold leading-tight truncate">{property.name}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground truncate">
                {property.address}, {property.city}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
          </div>

          {/* Specs */}
          {(property.bedrooms || property.bathrooms) && (
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              {property.bedrooms && <span>{property.bedrooms} bd</span>}
              {property.bathrooms && <span>{property.bathrooms} ba</span>}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{upcomingTourCount} upcoming tour{upcomingTourCount !== 1 ? "s" : ""}</span>
            </div>

            {isLowBattery && (
              <div className="flex items-center gap-1 text-yellow-600">
                <BatteryLow className="h-3.5 w-3.5" />
                <span>{Math.round((lockStatus?.battery ?? 0) * 100)}% battery</span>
              </div>
            )}

            {hasLock && !lockStatus?.online && (
              <span className="text-red-500">Lock offline</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
