import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout, TopBar } from "@/components/layout";
import { PRIVACY_DOC, TERMS_DOC, type LegalDoc } from "@/content/legal";

interface LegalScreenProps {
  doc: "privacy" | "terms";
}

const DOCS: Record<LegalScreenProps["doc"], LegalDoc> = {
  privacy: PRIVACY_DOC,
  terms: TERMS_DOC,
};

export function LegalScreen({ doc }: LegalScreenProps) {
  const navigate = useNavigate();
  const content = DOCS[doc];

  return (
    // ponytail: static bg on legal pages — the animated ShapeGrid rAF loop janks long scrolls
    <AppLayout
      animated={false}
      topBar={
        <TopBar
          left={
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              title="Back"
              className="flex items-center justify-center h-12 w-16 -ml-4 text-secondary transition-colors cursor-pointer hover:bg-hover hover:text-primary"
            >
              <ArrowLeft size={18} />
            </button>
          }
        />
      }
    >
      <main className="flex-1 w-full max-w-[720px] mx-auto px-6 sm:px-8 py-10">
        <p className="text-sm text-muted">
          Effective date: {content.effectiveDate}
        </p>
        <h1 className="font-display uppercase tracking-tight leading-[0.95] text-[clamp(2.2rem,5vw,3.6rem)] mt-2">
          {content.title}
        </h1>
        <div className="mt-6 flex flex-col gap-4 border-t-2 border-accent pt-6">
          {content.intro.map((p, i) => (
            <p
              key={i}
              className="text-[15px] text-secondary leading-relaxed max-w-[68ch]"
            >
              {p}
            </p>
          ))}
        </div>

        <div className="mt-8 flex flex-col">
          {content.sections.map((section, i) => (
            <section
              key={section.heading}
              className="border-t border-line py-6"
            >
              <h2 className="font-display uppercase tracking-wide text-lg">
                <span className="text-accent mr-3 text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((p, j) => (
                  <p
                    key={j}
                    className="text-[15px] text-secondary leading-relaxed max-w-[68ch]"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </AppLayout>
  );
}

export function PrivacyScreen() {
  return <LegalScreen doc="privacy" />;
}

export function TermsScreen() {
  return <LegalScreen doc="terms" />;
}
