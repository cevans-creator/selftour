"use client";

import { useState } from "react";
import { formatTime, formatDate } from "@/lib/utils";
import { TOUR_STATUS_STYLES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  allowCancel?: boolean;
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

const CANCELLABLE: TourStatus[] = ["scheduled", "access_sent", "in_progress"];

function CancelButton({ tourId }: { tourId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleCancel = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/tours/${tourId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to cancel tour");
        return;
      }
      toast.success("Tour cancelled");
      router.refresh();
    } catch {
      toast.error("Failed to cancel tour");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className={`h-9 px-3 text-xs gap-1 ${confirming ? "border-red-400 text-red-600 hover:bg-red-50" : "text-gray-500 hover:text-red-600 hover:border-red-300"}`}
      onClick={(e) => { e.stopPropagation(); void handleCancel(); }}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <X className="h-3 w-3" />
      )}
      {confirming ? "Confirm?" : "Cancel"}
    </Button>
  );
}

export function TourTable({
  tours,
  onTourClick,
  emptyMessage = "No tours found.",
  allowCancel = false,
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
              {allowCancel && <TableHead />}
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
                {allowCancel && (
                  <TableCell>
                    {CANCELLABLE.includes(tour.status) && (
                      <CancelButton tourId={tour.id} />
                    )}
                  </TableCell>
                )}
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
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={STATUS_BADGE_VARIANT[tour.status]}>
                  {TOUR_STATUS_STYLES[tour.status]?.label ?? tour.status}
                </Badge>
                {allowCancel && CANCELLABLE.includes(tour.status) && (
                  <CancelButton tourId={tour.id} />
                )}
              </div>
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
