import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
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
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [membership] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.organizationId, organizations.id))
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  if (!membership) redirect("/login?no_org=1");
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
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
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
                            <p className="font-medium">{visitor.firstName} {visitor.lastName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{visitor.email}</p>
                          <p className="text-xs text-muted-foreground">{formatPhone(visitor.phone)}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <VerificationIcon method={visitor.idVerificationMethod} status={visitor.idVerificationStatus} />
                            <span className="text-xs text-muted-foreground capitalize">{visitor.idVerificationStatus ?? "none"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {tourCountMap.get(visitor.id) ?? 0} tour{(tourCountMap.get(visitor.id) ?? 0) !== 1 ? "s" : ""}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(visitor.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-border">
                {rows.map((visitor) => (
                  <div key={visitor.id} className="flex items-start gap-3 p-4">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {visitor.firstName[0]}{visitor.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{visitor.firstName} {visitor.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{visitor.email}</p>
                      <p className="text-xs text-muted-foreground">{formatPhone(visitor.phone)}</p>
                    </div>
                    <div className="flex-shrink-0 text-right space-y-1">
                      <Badge variant="secondary" className="text-xs">
                        {tourCountMap.get(visitor.id) ?? 0} tour{(tourCountMap.get(visitor.id) ?? 0) !== 1 ? "s" : ""}
                      </Badge>
                      <div className="flex items-center justify-end gap-1">
                        <VerificationIcon method={visitor.idVerificationMethod} status={visitor.idVerificationStatus} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
