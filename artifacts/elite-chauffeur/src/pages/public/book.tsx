import BookingForm from "@/components/booking-form";
import { useI18n } from "@/lib/i18n";

export default function Book() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-primary mb-4" style={{ fontFamily: "var(--font-serif)" }}>{t.book.title}</h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg">{t.book.subtitle}</p>
        </div>
        <BookingForm isFullPage={true} />
      </div>
    </div>
  );
}
