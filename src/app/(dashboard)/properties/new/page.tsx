"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOUR_DURATION_OPTIONS, BUFFER_TIME_OPTIONS, DAY_LABELS } from "@/lib/constants";

export default function NewPropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    type: "single_family",
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
    availableDays: [1, 2, 3, 4, 5] as number[],
  });

  const toggleDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day].sort(),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
          squareFeet: form.squareFeet ? parseInt(form.squareFeet) : undefined,
          price: form.price ? Math.round(parseFloat(form.price) * 100) : undefined,
          tourDurationMinutes: parseInt(form.tourDurationMinutes),
          bufferMinutes: parseInt(form.bufferMinutes),
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed to create property");
        return;
      }

      const { id } = (await res.json()) as { id: string };
      toast.success("Property created!");
      router.push(`/properties/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add Property</h1>
          <p className="text-muted-foreground">Create a new listing for self-guided tours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., The Oakwood — Unit 4B"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Oak Street"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" name="city" placeholder="Austin" value={form.city} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input id="state" name="state" placeholder="TX" value={form.state} onChange={handleChange} required maxLength={2} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input id="zip" name="zip" placeholder="78701" value={form.zip} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Select id="type" name="type" value={form.type} onChange={handleChange}>
                  <option value="single_family">Single Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhome">Townhome</option>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input id="bedrooms" name="bedrooms" type="number" min="0" placeholder="3" value={form.bedrooms} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input id="bathrooms" name="bathrooms" placeholder="2.5" value={form.bathrooms} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="squareFeet">Sq Ft</Label>
                <Input id="squareFeet" name="squareFeet" type="number" placeholder="1800" value={form.squareFeet} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Asking Price ($)</Label>
              <Input id="price" name="price" type="number" placeholder="350000" value={form.price} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Describe the property..." value={form.description} onChange={handleChange} rows={4} />
            </div>
          </CardContent>
        </Card>

        {/* Tour Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tour Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tourDurationMinutes">Tour Duration</Label>
                <Select id="tourDurationMinutes" name="tourDurationMinutes" value={form.tourDurationMinutes} onChange={handleChange}>
                  {TOUR_DURATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bufferMinutes">Buffer Between Tours</Label>
                <Select id="bufferMinutes" name="bufferMinutes" value={form.bufferMinutes} onChange={handleChange}>
                  {BUFFER_TIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availableFrom">Available From</Label>
                <Input id="availableFrom" name="availableFrom" type="time" value={form.availableFrom} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableTo">Available To</Label>
                <Input id="availableTo" name="availableTo" type="time" value={form.availableTo} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex gap-2">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      form.availableDays.includes(i)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Smart Lock */}
        <Card>
          <CardHeader>
            <CardTitle>Smart Lock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="seamDeviceId">Seam Device ID</Label>
              <Input
                id="seamDeviceId"
                name="seamDeviceId"
                placeholder="device_xxxxxxxx"
                value={form.seamDeviceId}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Connect a smart lock in the{" "}
                <Link href="/integrations" className="text-primary hover:underline">
                  Integrations
                </Link>{" "}
                page, then paste the device ID here.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/properties">Cancel</Link>
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Property
          </Button>
        </div>
      </form>
    </div>
  );
}
