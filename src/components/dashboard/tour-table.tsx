"use client";

import { formatTime, formatDate } from "@/lib/utils";
import { TOUR_STATUS_STYLES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TourStatus } from "@/types";

interface TourRow {
  tour: {
    id: string;
    status: TourStatus;
    scheduledAt: Date;
    endsAt: Date;
    accessCode: string | null;
  };
  property: {
    address: string;
    city: string;
    state: string;
  };
  visitor: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
}

interface TourTableProps {
  tours: TourRow[];
  onTourClick?: (tourId: string) => void;
  emptyMessage?: string;
}

const STATUS_BADGE_VARIANT: Record<
  TourStatus,
  "default" | "success" | "warning" | "info" | "destructive" | "purple" | "gray" | "orange"
> = {
  scheduled: "info",
  access_sent: "purple",
  in_progress: "success",
  completed: "gray",
  cancelled: "destructive",
  no_show: "orange",
};

export function TourTable({
  tours,
  onTourClick,
  emptyMessage = "No tours found.",
}: TourTableProps) {
  if (tours.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.map(({ tour, property, visitor }) => (
              <TableRow
                key={tour.id}
                className={onTourClick ? "cursor-pointer" : ""}
                onClick={() => onTourClick?.(tour.id)}
              >
                <TableCell>
                  <p className="font-medium">{visitor.firstName} {visitor.lastName}</p>
                  <p className="text-xs text-muted-foreground">{visitor.phone}</p>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{property.address}</p>
                  <p className="text-xs text-muted-foreground">{property.city}, {property.state}</p>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{formatDate(tour.scheduledAt)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(tour.scheduledAt)} – {formatTime(tour.endsAt)}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANT[tour.status]}>
                    {TOUR_STATUS_STYLES[tour.status]?.label ?? tour.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {tour.accessCode ? (
                    <code className="rounded bg-muted px-2 py-1 text-sm font-mono">{tour.accessCode}</code>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-border">
        {tours.map(({ tour, property, visitor }) => (
          <div
            key={tour.id}
            className={`p-4 space-y-2 ${onTourClick ? "cursor-pointer active:bg-muted/50" : ""}`}
            onClick={() => onTourClick?.(tour.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{visitor.firstName} {visitor.lastName}</p>
                <p className="text-xs text-muted-foreground">{visitor.phone}</p>
              </div>
              <Badge variant={STATUS_BADGE_VARIANT[tour.status]} className="flex-shrink-0">
                {TOUR_STATUS_STYLES[tour.status]?.label ?? tour.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{property.address}, {property.city}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatDate(tour.scheduledAt)} · {formatTime(tour.scheduledAt)}
              </p>
              {tour.accessCode && (
                <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{tour.accessCode}</code>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
