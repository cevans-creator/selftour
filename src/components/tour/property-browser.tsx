import Link from "next/link";
import { Home, BedDouble, Bath, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface BrowseProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  bedrooms: number | null;
  bathrooms: string | null;
  squareFeet: number | null;
  price: number | null;
  description: string | null;
  imageUrls: string[];
}

interface PropertyBrowserProps {
  properties: BrowseProperty[];
  orgSlug: string;
  primaryColor?: string;
}

export function PropertyBrowser({
  properties,
  orgSlug,
  primaryColor = "#2563eb",
}: PropertyBrowserProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Home className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold">No properties available</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back soon for available homes.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <Link
          key={property.id}
          href={`/tour/${orgSlug}/${property.id}`}
          className="group"
        >
          <Card className="overflow-hidden transition-shadow hover:shadow-lg">
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-muted">
              {property.imageUrls[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={property.imageUrls[0]}
                  alt={property.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Home className="h-16 w-16 text-muted-foreground/20" />
                </div>
              )}
              {property.price && (
                <div className="absolute bottom-3 left-3">
                  <span
                    className="rounded-md px-2 py-1 text-sm font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {formatCurrency(property.price)}
                  </span>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold leading-tight">{property.name}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {property.address}, {property.city}, {property.state}
              </p>

              {/* Specs row */}
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                {property.bedrooms !== null && (
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" />
                    {property.bedrooms} bd
                  </span>
                )}
                {property.bathrooms && (
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" />
                    {property.bathrooms} ba
                  </span>
                )}
                {property.squareFeet && (
                  <span className="flex items-center gap-1">
                    <Square className="h-3.5 w-3.5" />
                    {property.squareFeet.toLocaleString()} sqft
                  </span>
                )}
              </div>

              {property.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {property.description}
                </p>
              )}

              <div
                className="mt-4 flex w-full items-center justify-center rounded-md py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Schedule a Tour
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
