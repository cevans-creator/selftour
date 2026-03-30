// ─── Tour configuration ───────────────────────────────────────────────────────

export const TOUR_DURATION_OPTIONS = [
  { label: "15 minutes", value: 15 },
  { label: "20 minutes", value: 20 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "60 minutes", value: 60 },
  { label: "90 minutes", value: 90 },
];

export const BUFFER_TIME_OPTIONS = [
  { label: "No buffer", value: 0 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
];

export const DEFAULT_TOUR_DURATION_MINUTES = 30;
export const DEFAULT_BUFFER_MINUTES = 10;

// How early before the tour we provision the access code (minutes)
export const ACCESS_CODE_PROVISION_LEAD_TIME_MINUTES = 15;

// How long after tour starts before marking as no-show (minutes)
export const NO_SHOW_THRESHOLD_MINUTES = 15;

// ─── Scheduling ───────────────────────────────────────────────────────────────

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DEFAULT_AVAILABLE_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri

export const DEFAULT_AVAILABLE_FROM = "09:00";
export const DEFAULT_AVAILABLE_TO = "17:00";

// Number of days ahead to show for slot picker
export const SLOT_LOOKAHEAD_DAYS = 30;

// ─── Plan limits ──────────────────────────────────────────────────────────────

export const PLAN_LIMITS: Record<
  string,
  { properties: number; toursPerMonth: number; teamMembers: number }
> = {
  free: { properties: 2, toursPerMonth: 20, teamMembers: 1 },
  starter: { properties: 10, toursPerMonth: 100, teamMembers: 3 },
  growth: { properties: 50, toursPerMonth: 500, teamMembers: 10 },
  enterprise: { properties: Infinity, toursPerMonth: Infinity, teamMembers: Infinity },
};

export const PLAN_PRICES: Record<string, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  starter: { monthly: 9900, annual: 8900 }, // cents
  growth: { monthly: 29900, annual: 24900 },
  enterprise: { monthly: 0, annual: 0 }, // contact sales
};

// ─── AI ───────────────────────────────────────────────────────────────────────

export const AI_MODEL = "claude-3-5-haiku-20241022";
export const AI_MAX_RESPONSE_CHARS = 300; // SMS-friendly
export const AI_MAX_KNOWLEDGE_ENTRIES = 50;

// ─── Access codes ─────────────────────────────────────────────────────────────

export const BANNED_ACCESS_CODES = ["1234", "0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "0123"];

// ─── Navigation ───────────────────────────────────────────────────────────────

export const DASHBOARD_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Properties", href: "/properties", icon: "Home" },
  { label: "Tours", href: "/tours", icon: "Calendar" },
  { label: "Visitors", href: "/visitors", icon: "Users" },
  { label: "Messaging", href: "/messaging", icon: "MessageSquare" },
  { label: "AI Knowledge", href: "/ai-knowledge", icon: "Brain" },
  { label: "Integrations", href: "/integrations", icon: "Plug" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

// ─── Tour status styles ───────────────────────────────────────────────────────

export const TOUR_STATUS_STYLES: Record<
  string,
  { label: string; color: string }
> = {
  scheduled: { label: "Scheduled", color: "blue" },
  access_sent: { label: "Access Sent", color: "purple" },
  in_progress: { label: "In Progress", color: "green" },
  completed: { label: "Completed", color: "gray" },
  cancelled: { label: "Cancelled", color: "red" },
  no_show: { label: "No Show", color: "orange" },
};
