import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardBody } from '../ui';
import { AppLayout, TopBar } from '../layout';
import { PRIVACY_DOC, TERMS_DOC, type LegalDoc } from '../../content/legal';

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
        showSettings={false}
        left={
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft size={18} />
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto w-full max-w-[760px] flex flex-col gap-4">
          <Card>
            <CardBody className="flex flex-col gap-3">
              <h1 className="text-xl font-bold">{content.title}</h1>
              <p className="text-xs text-muted">Effective date: {content.effectiveDate}</p>
              {content.intro.map((p, i) => (
                <p key={i} className="text-sm text-secondary leading-relaxed">
                  {p}
                </p>
              ))}
            </CardBody>
          </Card>

          {content.sections.map((section) => (
            <Card key={section.heading}>
              <CardBody className="flex flex-col gap-2">
                <h2 className="text-base font-semibold">{section.heading}</h2>
                {section.body.map((p, i) => (
                  <p key={i} className="text-sm text-secondary leading-relaxed">
                    {p}
                  </p>
                ))}
              </CardBody>
            </Card>
          ))}

          <Card>
            <CardBody className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">Contact</h2>
              {content.contact.map((p, i) => (
                <p key={i} className="text-sm text-secondary leading-relaxed">
                  {p}
                </p>
              ))}
            </CardBody>
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
