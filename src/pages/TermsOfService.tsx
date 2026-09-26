import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HaqqatLogo from "@/components/HaqqatLogo";

export default function TermsOfService() {
  const navigate = useNavigate();
  const lastUpdated = "April 3, 2026";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <HaqqatLogo size={20} />
            <span className="font-display text-foreground text-lg">Haqqat</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-display text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Haqqat ("the App", "the Service") at haqqat.netlify.app, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We reserve the right to update these terms at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Haqqat is a productivity application that helps users track habits, goals, tasks, focus sessions, and provides AI-powered coaching. The Service is provided "as is" and we make no guarantees about uptime, feature availability, or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Account Registration</h2>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "You must provide accurate information when creating an account",
                "You are responsible for maintaining the security of your account credentials",
                "You must be at least 13 years old to use this Service",
                "One person may not maintain multiple free accounts to circumvent usage limits",
                "You are responsible for all activity that occurs under your account",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1 shrink-0">→</span> {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Free Plan Limitations</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">The free plan includes:</p>
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              {[
                "Full access to all productivity features (tasks, goals, routines, focus, etc.)",
                "AI Coach: 10 messages per day",
                "Data storage: Subject to free tier limits",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-green-500">✓</span> {item}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              We reserve the right to modify free plan limits at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You agree NOT to:</p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Use the Service for any unlawful purpose",
                "Attempt to gain unauthorized access to our systems or other users' accounts",
                "Use automated scripts or bots to access the Service",
                "Circumvent or attempt to bypass AI usage limits",
                "Upload malicious content, viruses, or harmful code",
                "Use the AI Coach to generate harmful, illegal, or abusive content",
                "Resell or redistribute access to the Service without our written consent",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-destructive mt-1 shrink-0">✗</span> {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Your Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of all content you create in Haqqat (tasks, goals, journal entries, etc.). By using the Service, you grant us a limited, non-exclusive license to store and process your content solely for the purpose of providing the Service to you. We do not sell, share, or use your personal productivity data for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. AI Coach Disclaimer</h2>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-sm text-foreground leading-relaxed">
                The AI Coach feature provides general productivity advice based on your data. It is <strong>not</strong> a substitute for professional advice (medical, psychological, financial, legal, or otherwise). AI responses may be inaccurate or incomplete. Always use your own judgment when acting on AI suggestions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Haqqat name, logo, design, and underlying code are our intellectual property. You may not copy, modify, distribute, or create derivative works from any part of the Service without our explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any time if you violate these Terms. Upon termination, your data will be deleted in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Haqqat shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of data, loss of productivity, or business interruption. Our total liability shall not exceed the amount you have paid us in the past 12 months (which for free users is zero).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through good-faith negotiation first, followed by binding arbitration if necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">12. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For any questions about these Terms, contact us through the app at haqqat.netlify.app.</p>
          </section>

        </div>
      </div>

      <div className="border-t border-border mt-16 py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 Haqqat · <button onClick={() => navigate("/privacy")} className="text-primary hover:underline">Privacy Policy</button></p>
      </div>
    </div>
  );
}
