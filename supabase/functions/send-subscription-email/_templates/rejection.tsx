import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface RejectionProps {
  userName: string;
  planType: string;
  rejectionReason: string;
  confirmationCode: string;
}

export const Rejection = ({
  userName,
  planType,
  rejectionReason,
  confirmationCode,
}: RejectionProps) => {
  const planNames: Record<string, string> = {
    individual: 'Individual',
    church_simple: 'Igreja Simples',
    church_plus: 'Igreja Plus',
    church_premium: 'Igreja Premium',
  };

  return (
    <Html>
      <Head />
      <Preview>Atualização sobre sua assinatura Hodos</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Atualização sobre sua assinatura</Heading>
          
          <Text style={text}>Olá, {userName}!</Text>
          
          <Text style={text}>
            Agradecemos seu interesse no Hodos. Infelizmente, não foi possível aprovar sua assinatura do <strong>Plano {planNames[planType] || planType}</strong> no momento.
          </Text>

          <Section style={infoBox}>
            <Text style={infoLabel}>Código de Confirmação:</Text>
            <code style={code}>{confirmationCode}</code>
          </Section>

          <Section style={reasonBox}>
            <Text style={reasonLabel}>Motivo:</Text>
            <Text style={reasonText}>{rejectionReason}</Text>
          </Section>

          <Text style={text}>
            <strong>O que você pode fazer:</strong>
          </Text>
          <Text style={text}>
            • Entre em contato conosco para esclarecimentos<br />
            • Corrija as informações necessárias<br />
            • Tente novamente após resolver a pendência
          </Text>

          <Link
            href="https://ndmuamcrsozbhavnohle.supabase.co/planos"
            target="_blank"
            style={button}
          >
            Ver Planos Novamente
          </Link>

          <Text style={text}>
            Estamos à disposição para ajudar. Entre em contato:<br />
            📧 Email: suporte@hodos.com.br<br />
            💬 WhatsApp: (11) 99999-9999
          </Text>

          <Text style={footer}>
            <Link
              href="https://ndmuamcrsozbhavnohle.supabase.co"
              target="_blank"
              style={footerLink}
            >
              Hodos
            </Link>
            {' '}- Sua jornada de fé começa aqui
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default Rejection;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
};

const infoBox = {
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  border: '1px solid #ddd',
  margin: '24px',
  padding: '16px',
};

const infoLabel = {
  color: '#666',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const code = {
  display: 'block',
  padding: '8px',
  backgroundColor: '#fff',
  borderRadius: '4px',
  border: '1px solid #ddd',
  color: '#333',
  fontSize: '14px',
  fontFamily: 'monospace',
};

const reasonBox = {
  backgroundColor: '#fff5f5',
  borderRadius: '8px',
  border: '2px solid #feb2b2',
  margin: '24px',
  padding: '16px',
};

const reasonLabel = {
  color: '#c53030',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const reasonText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const button = {
  backgroundColor: '#7b2ff7',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '24px 24px',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
  textAlign: 'center' as const,
  padding: '0 24px',
};

const footerLink = {
  color: '#7b2ff7',
  textDecoration: 'underline',
};
