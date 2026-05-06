import { useState } from "react";
import { useListReservations, useUpdateReservation, useDeleteReservation, getListReservationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Mail, Loader2, FileDown, Trash2, CheckCircle, Bell, Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAdminAuth } from "@/lib/admin-auth";
import { useSiteSettings } from "@/lib/site-settings";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  in_progress: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  completed: "bg-green-500/20 text-green-400 border-green-500/40",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/40",
};

type EmailType = "confirmation" | "reminder";
type EmailLang = "en" | "fr" | "es" | "de" | "ar";

const EMAIL_LANGS: { code: EmailLang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

function pad(id: number) { return String(id).padStart(5, "0"); }
function fmt(n: number | null | undefined) { return n != null ? `$${Number(n).toFixed(2)}` : "—"; }

function buildEmailBody(type: EmailType, lang: EmailLang, res: any): string {
  const id = `#${pad(res.id)}`;
  const date = `${res.pickupDate} ${res.pickupTime ? `at ${res.pickupTime}` : ""}`;
  const total = fmt(res.totalPrice);

  const tpl: Record<EmailLang, { conf: string; rem: string }> = {
    en: {
      conf: `Dear ${res.customerName},\n\nWe are pleased to confirm your reservation with Elite Chauffeur.\n\nReference: ${id}\nDate: ${date}\nPickup: ${res.pickupLocation}\nDrop-off: ${res.dropoffLocation}\nTotal: ${total}\n\nOur chauffeur will be waiting for you. For any questions, please contact us.\n\nThank you for choosing Elite Chauffeur.\n\nWarm regards,\nElite Chauffeur Team`,
      rem: `Dear ${res.customerName},\n\nThis is a friendly reminder for your upcoming reservation with Elite Chauffeur.\n\nReference: ${id}\nDate: ${date}\nFrom: ${res.pickupLocation}\nTo: ${res.dropoffLocation}\nAmount: ${total}\n\nIf you have any questions, please do not hesitate to contact us.\n\nThank you,\nElite Chauffeur Team`,
    },
    fr: {
      conf: `Cher(e) ${res.customerName},\n\nNous sommes ravis de confirmer votre réservation chez Elite Chauffeur.\n\nRéférence : ${id}\nDate : ${date}\nPrise en charge : ${res.pickupLocation}\nDépôt : ${res.dropoffLocation}\nTotal : ${total}\n\nNotre chauffeur vous attendra. Pour toute question, n'hésitez pas à nous contacter.\n\nMerci de choisir Elite Chauffeur.\n\nCordialement,\nL'équipe Elite Chauffeur`,
      rem: `Cher(e) ${res.customerName},\n\nCeci est un rappel pour votre prochaine réservation chez Elite Chauffeur.\n\nRéférence : ${id}\nDate : ${date}\nDe : ${res.pickupLocation}\nÀ : ${res.dropoffLocation}\nMontant : ${total}\n\nPour toute question, contactez-nous.\n\nMerci,\nL'équipe Elite Chauffeur`,
    },
    es: {
      conf: `Estimado/a ${res.customerName},\n\nNos complace confirmar su reservación con Elite Chauffeur.\n\nReferencia: ${id}\nFecha: ${date}\nRecogida: ${res.pickupLocation}\nDestino: ${res.dropoffLocation}\nTotal: ${total}\n\nNuestro chofer lo estará esperando. Para cualquier pregunta, no dude en contactarnos.\n\nGracias por elegir Elite Chauffeur.\n\nAtentamente,\nEquipo Elite Chauffeur`,
      rem: `Estimado/a ${res.customerName},\n\nEste es un recordatorio de su próxima reservación con Elite Chauffeur.\n\nReferencia: ${id}\nFecha: ${date}\nDesde: ${res.pickupLocation}\nHasta: ${res.dropoffLocation}\nImporte: ${total}\n\nSi tiene alguna pregunta, contáctenos.\n\nGracias,\nEquipo Elite Chauffeur`,
    },
    de: {
      conf: `Sehr geehrte/r ${res.customerName},\n\nWir freuen uns, Ihre Reservierung bei Elite Chauffeur zu bestätigen.\n\nReferenz: ${id}\nDatum: ${date}\nAbholung: ${res.pickupLocation}\nZiel: ${res.dropoffLocation}\nGesamtbetrag: ${total}\n\nUnser Fahrer wird auf Sie warten. Bei Fragen stehen wir Ihnen gerne zur Verfügung.\n\nVielen Dank, dass Sie Elite Chauffeur gewählt haben.\n\nMit freundlichen Grüßen,\nTeam Elite Chauffeur`,
      rem: `Sehr geehrte/r ${res.customerName},\n\nDies ist eine freundliche Erinnerung an Ihre bevorstehende Reservierung bei Elite Chauffeur.\n\nReferenz: ${id}\nDatum: ${date}\nVon: ${res.pickupLocation}\nNach: ${res.dropoffLocation}\nBetrag: ${total}\n\nBei Fragen kontaktieren Sie uns bitte.\n\nMit freundlichen Grüßen,\nTeam Elite Chauffeur`,
    },
    ar: {
      conf: `عزيزي/عزيزتي ${res.customerName}،\n\nيسعدنا تأكيد حجزك لدى Elite Chauffeur.\n\nرقم المرجع: ${id}\nالتاريخ: ${date}\nنقطة الانطلاق: ${res.pickupLocation}\nالوجهة: ${res.dropoffLocation}\nالمجموع: ${total}\n\nسيكون سائقنا في انتظارك. لأي استفسار، لا تتردد في التواصل معنا.\n\nشكراً لاختيارك Elite Chauffeur.\n\nمع أطيب التحيات،\nفريق Elite Chauffeur`,
      rem: `عزيزي/عزيزتي ${res.customerName}،\n\nهذا تذكير بموعد حجزك القادم لدى Elite Chauffeur.\n\nرقم المرجع: ${id}\nالتاريخ: ${date}\nمن: ${res.pickupLocation}\nإلى: ${res.dropoffLocation}\nالمبلغ: ${total}\n\nإذا كان لديك أي استفسار، يرجى التواصل معنا.\n\nشكراً،\nفريق Elite Chauffeur`,
    },
  };

  return type === "confirmation" ? tpl[lang].conf : tpl[lang].rem;
}

async function imageToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

async function printInvoice(res: any, invoiceLogoUrl?: string | null) {
  const win = window.open("", "_blank", "width=820,height=950");
  if (!win) return;

  let logoHtml = `<div class="brand">Elite Chauffeur</div><div class="brand-sub">Luxury Transfer Services</div>`;
  if (invoiceLogoUrl) {
    const dataUrl = await imageToDataUrl(invoiceLogoUrl);
    if (dataUrl) {
      logoHtml = `<img src="${dataUrl}" style="max-height:72px;max-width:240px;object-fit:contain;display:block;" alt="Logo" />`;
    }
  }

  win.document.write(`
    <!DOCTYPE html><html>
    <head>
      <title>Invoice #${res.id} — Elite Chauffeur</title>
      <style>
        * { margin:0;padding:0;box-sizing:border-box; }
        body { font-family:'Georgia',serif;color:#111;background:#fff;padding:48px; }
        .header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;border-bottom:2px solid #111;padding-bottom:24px; }
        .brand { font-size:22px;font-weight:bold;letter-spacing:4px;text-transform:uppercase; }
        .brand-sub { font-size:11px;letter-spacing:2px;color:#555;margin-top:4px; }
        .invoice-meta { text-align:right; }
        .invoice-meta h2 { font-size:28px;font-weight:bold;letter-spacing:2px;text-transform:uppercase; }
        .invoice-meta p { font-size:12px;color:#555;margin-top:4px; }
        .section { margin-bottom:32px; }
        .section-title { font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:6px; }
        .grid { display:grid;grid-template-columns:1fr 1fr;gap:32px; }
        .field-label { font-size:11px;color:#888;margin-bottom:2px; }
        .field-value { font-size:14px;font-weight:500; }
        .billing-table { width:100%;border-collapse:collapse;margin-top:8px; }
        .billing-table tr td { padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px; }
        .billing-table tr td:last-child { text-align:right; }
        .billing-total { font-weight:bold;font-size:18px;border-top:2px solid #111 !important;padding-top:12px !important; }
        .status-badge { display:inline-block;padding:4px 12px;border-radius:4px;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;background:#f0f0f0; }
        .footer { margin-top:64px;text-align:center;font-size:11px;color:#aaa;letter-spacing:1px; }
        @media print { body { padding:24px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>${logoHtml}</div>
        <div class="invoice-meta">
          <h2>Invoice</h2>
          <p>#${String(res.id).padStart(5, "0")}</p>
          <p style="margin-top:8px;">Date: ${res.pickupDate}</p>
          <span class="status-badge">${res.status.replace("_", " ")}</span>
        </div>
      </div>

      <div class="grid">
        <div class="section">
          <div class="section-title">Client</div>
          <div class="field-value" style="font-size:16px;margin-bottom:4px;">${res.customerName}</div>
          <div style="font-size:13px;color:#555;">${res.customerEmail}</div>
          ${res.customerPhone ? `<div style="font-size:13px;color:#555;">${res.customerPhone}</div>` : ""}
        </div>
        <div class="section">
          <div class="section-title">Vehicle</div>
          <div class="field-value">${res.car ? `${res.car.brand} ${res.car.model}` : "—"}</div>
          ${res.driver ? `<div style="font-size:13px;color:#555;">Chauffeur: ${res.driver.name}</div>` : ""}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Journey Details</div>
        <div class="grid">
          <div>
            <div class="field-label">Pickup</div>
            <div class="field-value">${res.pickupLocation}</div>
            <div style="margin-top:8px;">
              <div class="field-label">Date &amp; Time</div>
              <div class="field-value">${res.pickupDate} at ${res.pickupTime}</div>
            </div>
          </div>
          <div>
            <div class="field-label">Drop-off</div>
            <div class="field-value">${res.dropoffLocation}</div>
            ${res.distanceKm != null ? `<div style="margin-top:8px;"><div class="field-label">Distance</div><div class="field-value">${Number(res.distanceKm).toFixed(1)} km</div></div>` : ""}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Billing</div>
        <table class="billing-table">
          ${res.car ? `<tr><td>Base Fee</td><td>$${Number(res.car.baseFee).toFixed(2)}</td></tr>` : ""}
          ${res.distanceKm != null && res.car ? `<tr><td>Distance (${Number(res.distanceKm).toFixed(1)} km × $${res.car.pricePerKm}/km)</td><td>$${(Number(res.distanceKm) * Number(res.car.pricePerKm)).toFixed(2)}</td></tr>` : ""}
          ${res.withDriver && res.driverFee > 0 ? `<tr><td>Chauffeur Fee</td><td>$${Number(res.driverFee).toFixed(2)}</td></tr>` : ""}
          <tr><td class="billing-total">Total</td><td class="billing-total">$${Number(res.totalPrice).toFixed(2)}</td></tr>
        </table>
      </div>

      ${res.notes ? `<div class="section"><div class="section-title">Notes</div><p style="font-size:13px;color:#555;">${res.notes}</p></div>` : ""}

      <div class="footer">Thank you for choosing Elite Chauffeur — Luxury at every mile.</div>
      <script>window.onload = () => { window.print(); }</script>
    </body></html>
  `);
  win.document.close();
}

export default function AdminReservations() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedResId, setSelectedResId] = useState<number | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailType, setEmailType] = useState<EmailType>("reminder");
  const [emailLang, setEmailLang] = useState<EmailLang>("en");
  const [emailMsg, setEmailMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { t } = useI18n();
  const { isAdmin } = useAdminAuth();
  const { invoiceLogoUrl } = useSiteSettings();
  const a = t.admin.reservations;
  const s = a.statuses;

  const { data: reservations, isLoading } = useListReservations(
    statusFilter !== "all" ? { status: statusFilter as any } : undefined
  );
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, newStatus: any) => {
    updateReservation.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: t.admin.common.save });
        queryClient.invalidateQueries({ queryKey: getListReservationsQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this reservation permanently? This cannot be undone.")) return;
    deleteReservation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Reservation deleted" });
        queryClient.invalidateQueries({ queryKey: getListReservationsQueryKey() });
        setSelectedResId(null);
      }
    });
  };

  const selectedRes = reservations?.find(r => r.id === selectedResId);

  const openEmailDialog = (type: EmailType) => {
    if (!selectedRes) return;
    setEmailType(type);
    setEmailMsg(buildEmailBody(type, emailLang, selectedRes));
    setEmailOpen(true);
  };

  const handleLangChange = (lang: EmailLang) => {
    setEmailLang(lang);
    if (selectedRes) setEmailMsg(buildEmailBody(emailType, lang, selectedRes));
  };

  const sendEmail = async () => {
    if (!selectedRes) return;
    setIsSending(true);
    try {
      const endpoint = emailType === "confirmation"
        ? `/api/reservations/${selectedRes.id}/confirm`
        : `/api/reservations/${selectedRes.id}/remind`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: emailMsg }),
      });
      const data = await res.json() as { success?: boolean; error?: string; note?: string };
      if (res.ok) {
        toast({ title: emailType === "confirmation" ? "Confirmation sent" : "Reminder sent", description: data.note ?? `Email sent to ${selectedRes.customerEmail}` });
        setEmailOpen(false);
      } else {
        toast({ title: "Error", description: data.error ?? "Email sending failed.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{a.title}</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={a.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{a.allStatuses}</SelectItem>
            <SelectItem value="pending">{s.pending}</SelectItem>
            <SelectItem value="confirmed">{s.confirmed}</SelectItem>
            <SelectItem value="in_progress">{s.in_progress}</SelectItem>
            <SelectItem value="completed">{s.completed}</SelectItem>
            <SelectItem value="cancelled">{s.cancelled}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>{a.id}</TableHead>
              <TableHead>{a.customer}</TableHead>
              <TableHead>{a.dateTime}</TableHead>
              <TableHead>{a.route}</TableHead>
              <TableHead>{a.amount}</TableHead>
              <TableHead>{a.status}</TableHead>
              <TableHead className="text-right">{a.action}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center h-24">{a.loading}</TableCell></TableRow>
            ) : reservations?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">{a.noReservations}</TableCell></TableRow>
            ) : (
              reservations?.map((res) => (
                <TableRow key={res.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">#{String(res.id).padStart(5, "0")}</TableCell>
                  <TableCell>
                    <div className="font-medium">{res.customerName}</div>
                    <div className="text-xs text-muted-foreground">{res.customerEmail}</div>
                  </TableCell>
                  <TableCell>
                    {res.pickupDate}<br />
                    <span className="text-muted-foreground text-xs">{res.pickupTime}</span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-xs" title={res.pickupLocation}>{res.pickupLocation}</div>
                    <div className="max-w-[200px] truncate text-xs text-muted-foreground" title={res.dropoffLocation}>→ {res.dropoffLocation}</div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">${Number(res.totalPrice)?.toFixed(2)}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Select defaultValue={res.status} onValueChange={(val) => handleStatusChange(res.id, val)}>
                        <SelectTrigger className={`h-8 border text-xs font-semibold ${statusColors[res.status] || ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{s.pending}</SelectItem>
                          <SelectItem value="confirmed">{s.confirmed}</SelectItem>
                          <SelectItem value="in_progress">{s.in_progress}</SelectItem>
                          <SelectItem value="completed">{s.completed}</SelectItem>
                          <SelectItem value="cancelled">{s.cancelled}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={`text-xs font-semibold ${statusColors[res.status] || ''}`}>
                        {res.status.replace("_", " ")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && (
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(res.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setSelectedResId(res.id)}>
                        {a.details}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Details dialog ─────────────────────────────── */}
      <Dialog open={!!selectedResId} onOpenChange={(open) => !open && setSelectedResId(null)}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-primary flex items-center justify-between">
              <span>{a.details} #{selectedRes ? String(selectedRes.id).padStart(5, "0") : ""}</span>
              {selectedRes && (
                <Badge variant="outline" className={`text-xs ${statusColors[selectedRes.status]}`}>
                  {selectedRes.status.replace("_", " ").toUpperCase()}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedRes && (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">{a.customerInfo}</h4>
                  <div className="bg-secondary/20 p-4 rounded-md border border-border">
                    <p className="font-semibold text-lg">{selectedRes.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedRes.customerEmail}</p>
                    <p className="text-sm text-muted-foreground">{selectedRes.customerPhone || a.noPhone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">{a.assignment}</h4>
                  <div className="bg-secondary/20 p-4 rounded-md border border-border space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{a.vehicle}</p>
                      <p className="font-medium">{selectedRes.car ? `${selectedRes.car.brand} ${selectedRes.car.model}` : a.unassigned}</p>
                    </div>
                    {selectedRes.withDriver && (
                      <div>
                        <p className="text-xs text-muted-foreground">{a.driver}</p>
                        <p className="font-medium">{selectedRes.driver ? selectedRes.driver.name : a.unassigned}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">{a.journeyDetails}</h4>
                <div className="bg-secondary/20 p-4 rounded-md border border-border space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{a.pickup}</p>
                      <p className="font-medium text-sm">{selectedRes.pickupLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{a.dropoff}</p>
                      <p className="font-medium text-sm">{selectedRes.dropoffLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-medium text-sm">{selectedRes.pickupDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-medium text-sm">{selectedRes.pickupTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">{a.billing}</h4>
                <div className="bg-primary/10 p-4 rounded-md border border-primary/30 space-y-2">
                  {selectedRes.distanceKm != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Distance</span>
                      <span>{Number(selectedRes.distanceKm).toFixed(1)} km</span>
                    </div>
                  )}
                  {selectedRes.car && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Fee</span>
                        <span>${Number(selectedRes.car.baseFee).toFixed(2)}</span>
                      </div>
                      {selectedRes.distanceKm != null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Distance Cost</span>
                          <span>${(Number(selectedRes.distanceKm) * Number(selectedRes.car.pricePerKm)).toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedRes.withDriver && selectedRes.driverFee != null && Number(selectedRes.driverFee) > 0 && (
                    <div className="flex justify-between text-sm text-amber-400">
                      <span className="font-medium">Chauffeur Fee</span>
                      <span className="font-medium">${Number(selectedRes.driverFee).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                    <span className="font-semibold text-primary">{a.total}</span>
                    <span className="font-bold text-2xl text-primary">${Number(selectedRes.totalPrice)?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedRes.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">{a.notes}</h4>
                  <div className="bg-secondary/20 p-4 rounded-md border border-border text-sm">{selectedRes.notes}</div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => printInvoice(selectedRes, invoiceLogoUrl)}>
                  <FileDown className="w-4 h-4" /> Export PDF
                </Button>
                <Button variant="outline" size="sm" className="gap-2 border-green-500/40 text-green-400 hover:bg-green-500/10" onClick={() => openEmailDialog("confirmation")}>
                  <CheckCircle className="w-4 h-4" /> Send Confirmation
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => openEmailDialog("reminder")}>
                  <Bell className="w-4 h-4" /> {a.sendReminder}
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" className="gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10 ml-auto" onClick={() => handleDelete(selectedRes.id)}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Email dialog ───────────────────────────────── */}
      <Dialog open={emailOpen} onOpenChange={(open) => !open && setEmailOpen(false)}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              {emailType === "confirmation"
                ? <><CheckCircle className="w-5 h-5 text-green-400" /> Confirmation — {selectedRes?.customerName}</>
                : <><Bell className="w-5 h-5" /> Reminder — {selectedRes?.customerName}</>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Language picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" /> Email Language
              </Label>
              <div className="flex gap-2 flex-wrap">
                {EMAIL_LANGS.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLangChange(lang.code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-all ${
                      emailLang === lang.code
                        ? "bg-primary text-primary-foreground border-primary font-semibold"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                To: <span className="text-foreground font-medium">{selectedRes?.customerEmail}</span>
              </Label>
              <Textarea
                rows={13}
                value={emailMsg}
                onChange={e => setEmailMsg(e.target.value)}
                className="font-mono text-sm resize-none bg-secondary/30 border-border text-foreground"
                dir={emailLang === "ar" ? "rtl" : "ltr"}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              To enable real email sending, configure <code className="bg-muted px-1 rounded text-xs">SMTP_HOST</code>, <code className="bg-muted px-1 rounded text-xs">SMTP_USER</code>, <code className="bg-muted px-1 rounded text-xs">SMTP_PASS</code> in your environment secrets.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>{a.cancel}</Button>
            <Button
              onClick={sendEmail}
              disabled={isSending}
              className={`gap-2 ${emailType === "confirmation" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {emailType === "confirmation" ? "Send Confirmation" : "Send Reminder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
