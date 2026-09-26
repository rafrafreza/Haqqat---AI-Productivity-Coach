import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HaqqatLogo from "@/components/HaqqatLogo";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const lastUpdated = "April 3, 2026";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        <h1 className="text-4xl font-display text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Haqqat ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our productivity application at haqqat.netlify.app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We collect the following types of information:</p>
            <div className="space-y-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">Account Information</h3>
                <p className="text-sm text-muted-foreground">Your email address and display name when you create an account. If you sign in with Google, we receive your name, email, and profile picture from Google.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">Productivity Data</h3>
                <p className="text-sm text-muted-foreground">Tasks, goals, routines, focus sessions, energy logs, decisions, and other content you create within the app. This data is stored in your account and used to power your personal dashboard and AI coaching.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">Usage Data</h3>
                <p className="text-sm text-muted-foreground">How frequently you use the AI Coach feature (message counts per day) to enforce fair usage limits. We do not log the content of your AI conversations beyond your current session.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">If you upload a profile picture, it is stored in our secure cloud storage (Supabase Storage) and is only accessible via your account.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "To provide, operate, and maintain the Haqqat application",
                "To personalize your experience and deliver AI coaching based on your productivity data",
                "To manage your account and authenticate your identity",
                "To enforce usage limits (AI Coach: 10 messages/day on the free plan)",
                "To improve our product based on aggregate, anonymized usage patterns",
                "To send you account-related emails (password reset, email confirmation)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1 shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Data Storage & Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Your data is stored securely using <strong className="text-foreground">Supabase</strong>, a trusted infrastructure provider. All data is encrypted in transit (HTTPS/TLS) and at rest. We use Row Level Security (RLS) policies to ensure that users can only access their own data.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Your productivity data (tasks, goals, routines, etc.) is currently stored in your browser's local storage in addition to our database. This means your data remains accessible even when offline.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Third-Party Services</h2>
            <div className="space-y-3">
              {[
                { name: "Supabase", use: "Database, authentication, and file storage. Your data lives on their servers.", link: "https://supabase.com/privacy" },
                { name: "Groq", use: "Powers the AI Coach feature. Your productivity data summary is sent to Groq's API to generate coaching responses. Groq does not store your data beyond processing your request.", link: "https://groq.com/privacy-policy" },
                { name: "Google (OAuth)", use: "If you sign in with Google, Google shares your basic profile information with us per their OAuth flow.", link: "https://policies.google.com/privacy" },
                { name: "Netlify", use: "Hosts the Haqqat web application.", link: "https://www.netlify.com/privacy/" },
              ].map(s => (
                <div key={s.name} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">Privacy Policy →</a>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.use}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your account data for as long as your account is active. If you delete your account, all your personal data will be permanently deleted from our systems within 30 days. AI usage logs are retained for 90 days for abuse prevention purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You have the right to:</p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Access the personal data we hold about you",
                "Correct inaccurate data in your profile (via Settings)",
                "Delete your account and all associated data",
                "Export your productivity data",
                "Opt out of any non-essential communications",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Haqqat is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the "Last updated" date at the top of this page. Continued use of Haqqat after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions or concerns about this Privacy Policy or how we handle your data, please contact us at:
            </p>
            <div className="mt-3 bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-foreground font-medium">Haqqat Support</p>
              <p className="text-sm text-muted-foreground mt-1">haqqat.netlify.app</p>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-16 py-8 text-center">
        <p className="text-xs text-muted-foreground">© 2026 Haqqat · <button onClick={() => navigate("/terms")} className="text-primary hover:underline">Terms of Service</button></p>
      </div>
    </div>
  );
}
