import { Check } from "lucide-react";
import AppShell, { Glass } from "../components/AppShell";

export default function ConfirmationPage() {
  return (
    <AppShell>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-[0_0_40px_rgba(120,220,140,0.5)]">
          <Check className="h-12 w-12 text-primary-foreground" strokeWidth={3} />
        </div>

        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
          Emergency Request confirmed
        </h1>
        <p className="mb-8 text-sm text-foreground/80">
          your request has been received and our system is responding immediatly
        </p>

        <Glass className="max-w-2xl px-10 py-6">
          <p className="mb-3 text-sm text-foreground/90">
            A rescue drone is being prepared and sent on the way to your location
          </p>
          <p className="text-sm text-foreground/90">
            Please stay calm and keep your device nearby for updates
          </p>
        </Glass>

        <a
          href="/request"
          className="mt-10 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
        >
          back to home page
        </a>
      </div>
    </AppShell>
  );
}