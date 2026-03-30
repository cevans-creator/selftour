import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import { visitors, tours, orgMembers, organizations } from "@/server/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { formatDate, formatPhone } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck, ShieldAlert, ShieldOff } from "lucide-react";

export default async function VisitorsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(s) { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!membership) redirect("/login");
  const org = membership.org;

  const rows = await db
    .select()
    .from(visitors)
    .where(eq(visitors.organizationId, org.id))
    .orderBy(desc(visitors.createdAt))
    .limit(100);

  // Get tour counts per visitor
  const tourCounts = await db
    .select({ visitorId: tours.visitorId, count: count() })
    .from(tours)
    .where(eq(tours.organizationId, org.id))
    .groupBy(tours.visitorId);

  const tourCountMap = new Map(tourCounts.map((t) => [t.visitorId, t.count]));

  const VerificationIcon = ({
    method,
    status,
  }: {
    method: string;
    status: string | null;
  }) => {
    if (method === "stripe_identity" && status === "verified") {
      return <ShieldCheck className="h-4 w-4 text-green-600" />;
    }
    if (status === "failed") {
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    }
    return <ShieldOff className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Visitors</h1>
        <p className="text-muted-foreground">{rows.length} total visitors</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Database</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No visitors yet. They'll appear here once they book a tour.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>ID Verification</TableHead>
                  <TableHead>Tours</TableHead>
                  <TableHead>First Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {visitor.firstName[0]}{visitor.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {visitor.firstName} {visitor.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{visitor.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPhone(visitor.phone)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <VerificationIcon
                          method={visitor.idVerificationMethod}
                          status={visitor.idVerificationStatus}
                        />
                        <span className="text-xs text-muted-foreground capitalize">
                          {visitor.idVerificationStatus ?? "none"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {tourCountMap.get(visitor.id) ?? 0} tour{(tourCountMap.get(visitor.id) ?? 0) !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(visitor.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
