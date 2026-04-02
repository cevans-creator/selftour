"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAY_OPTIONS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

interface PropertyForm {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  status: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  price: string;
  description: string;
  seamDeviceId: string;
  tourDurationMinutes: string;
  bufferMinutes: string;
  availableFrom: string;
  availableTo: string;
  availableDays: number[];
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [form, setForm] = useState<PropertyForm>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    type: "single_family",
    status: "active",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    price: "",
    description: "",
    seamDeviceId: "",
    tourDurationMinutes: "30",
    bufferMinutes: "10",
    availableFrom: "09:00",
    availableTo: "17:00",
    availableDays: [1, 2, 3, 4, 5],
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchProperty() {
      const res = await fetch(`/api/properties/${id}`);
      if (!res.ok) {
        toast.error("Property not found");
        router.push("/properties");
        return;
      }
      const data = await res.json() as Record<string, unknown>;
      setForm({
        name: String(data.name ?? ""),
        address: String(data.address ?? ""),
        city: String(data.city ?? ""),
        state: String(data.state ?? ""),
        zip: String(data.zip ?? ""),
        type: String(data.type ?? "single_family"),
        status: String(data.status ?? "active"),
        bedrooms: data.bedrooms != null ? String(data.bedrooms) : "",
        bathrooms: data.bathrooms != null ? String(data.bathrooms) : "",
        squareFeet: data.squareFeet != null ? String(data.squareFeet) : "",
        price: data.price != null ? String(Math.round(Number(data.price) / 100)) : "",
        description: String(data.description ?? ""),
        seamDeviceId: String(data.seamDeviceId ?? ""),
        tourDurationMinutes: String(data.tourDurationMinutes ?? "30"),
        bufferMinutes: String(data.bufferMinutes ?? "10"),
        availableFrom: String(data.availableFrom ?? "09:00"),
        availableTo: String(data.availableTo ?? "17:00"),
        availableDays: Array.isArray(data.availableDays) ? (data.availableDays as number[]) : [1, 2, 3, 4, 5],
      });
      setIsFetching(false);
    }
    void fetchProperty();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...form,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
          squareFeet: form.squareFeet ? parseInt(form.squareFeet) : null,
          price: form.price ? parseInt(form.price) * 100 : null,
          tourDurationMinutes: parseInt(form.tourDurationMinutes),
          bufferMinutes: parseInt(form.bufferMinutes),
          availableDays: form.availableDays,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        toast.error(data.error ?? "Failed to update property");
        return;
      }

      toast.success("Property updated!");
      router.push(`/properties/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/properties/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Property</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Property Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="The Aspen" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" name="address" value={form.address} onChange={handleChange} required placeholder="123 Main St" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" value={form.state} onChange={handleChange} required placeholder="TX" maxLength={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" name="zip" value={form.zip} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <select id="type" name="type" value={form.type} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="single_family">Single Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhome">Townhome</option>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" value={form.status} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the property..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Property Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} placeholder="3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" name="bathrooms" type="number" min="0" step="0.5" value={form.bathrooms} onChange={handleChange} placeholder="2.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="squareFeet">Sq Ft</Label>
              <Input id="squareFeet" name="squareFeet" type="number" min="0" value={form.squareFeet} onChange={handleChange} placeholder="2000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="350000" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Smart Lock</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="seamDeviceId">Seam Device ID</Label>
            <Input id="seamDeviceId" name="seamDeviceId" value={form.seamDeviceId} onChange={handleChange} placeholder="a5b06753-da6d-46e3-a91d-00d506f1c56b" className="font-mono text-sm" />
            <p className="text-xs text-muted-foreground">The device ID from your Seam-connected lock. Found in Settings → Integrations.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tour Availability</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Available Days</Label>
              <div className="flex gap-2 flex-wrap">
                {DAY_OPTIONS.map((day) => {
                  const isSelected = form.availableDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          availableDays: isSelected
                            ? prev.availableDays.filter((d) => d !== day.value)
                            : [...prev.availableDays, day.value].sort(),
                        }));
                      }}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium border transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-input hover:bg-accent"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="availableFrom">Opens</Label>
              <Input id="availableFrom" name="availableFrom" type="time" value={form.availableFrom} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableTo">Closes</Label>
              <Input id="availableTo" name="availableTo" type="time" value={form.availableTo} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tourDurationMinutes">Tour Duration (min)</Label>
              <Input id="tourDurationMinutes" name="tourDurationMinutes" type="number" min="15" max="180" step="15" value={form.tourDurationMinutes} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bufferMinutes">Buffer (min)</Label>
              <Input id="bufferMinutes" name="bufferMinutes" type="number" min="0" max="60" step="5" value={form.bufferMinutes} onChange={handleChange} />
            </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/properties/${id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
