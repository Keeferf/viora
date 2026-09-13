import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader } from '@/components/ui';
import { AppLayout, TopBar } from '@/components/layout';
import { PRIVACY_DOC, TERMS_DOC, type LegalDoc } from '@/content/legal';

interface LegalScreenProps {
  doc: 'privacy' | 'terms';
}

const DOCS: Record<LegalScreenProps['doc'], LegalDoc> = {
  privacy: PRIVACY_DOC,
  terms: TERMS_DOC,
};

export function LegalScreen({ doc }: LegalScreenProps) {
  const navigate = useNavigate();
  const content = DOCS[doc];

  return (
    <AppLayout>
      <TopBar
        title={content.title}
        subtitle={`Effective ${content.effectiveDate}`}
        left={
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft size={18} />
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto w-full max-w-[760px]">
          <Card padding="none">
            <CardHeader>
              <h1 className="font-display text-xl tracking-tight">{content.title}</h1>
              <p className="text-xs text-muted mt-1">Effective date: {content.effectiveDate}</p>
            </CardHeader>
            <div>
              <div className="flex flex-col gap-3 px-6 py-5">
                {content.intro.map((p, i) => (
                  <p key={i} className="text-sm text-secondary leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              <article className="flex flex-col divide-y divide-line border-t border-line">
                {content.sections.map((section) => (
                  <section key={section.heading} className="flex flex-col gap-2 px-6 py-5">
                    <h2 className="text-[13px] font-semibold uppercase tracking-wide text-primary">
                      {section.heading}
                    </h2>
                    {section.body.map((p, i) => (
                      <p key={i} className="text-sm text-secondary leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </section>
                ))}
              </article>
            </div>
          </Card>
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
