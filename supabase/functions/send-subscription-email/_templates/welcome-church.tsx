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

interface WelcomeChurchProps {
  userName: string;
  planType: string;
  churchSlug: string;
}

export const WelcomeChurch = ({
  userName,
  planType,
  churchSlug,
}: WelcomeChurchProps) => {
  const planNames: Record<string, string> = {
    church_simple: 'Igreja Simples',
    church_plus: 'Igreja Plus',
    church_premium: 'Igreja Premium',
  };

  return (
    <Html>
      <Head />
      <Preview>Sua igreja foi aprovada no Hodos! ⛪</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⛪ Bem-vindo ao Hodos!</Heading>
          
          <Text style={text}>Olá, {userName}!</Text>
          
          <Text style={text}>
            Temos ótimas notícias! A assinatura da sua igreja no <strong>Plano {planNames[planType] || planType}</strong> foi aprovada com sucesso.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              ✅ Assinatura ativa por 30 dias
            </Text>
            <Text style={highlightText}>
              👥 Gestão completa de membros
            </Text>
            <Text style={highlightText}>
              📚 Trilhas personalizadas
            </Text>
            <Text style={highlightText}>
              📊 Dashboard de métricas
            </Text>
            <Text style={highlightText}>
              🔔 Sistema de comunicação
            </Text>
          </Section>

          <Text style={text}>
            Sua igreja já está configurada no sistema! Use o link abaixo para convidar membros:
          </Text>

          <Section style={inviteBox}>
            <Text style={inviteLabel}>Link de Convite:</Text>
            <code style={code}>
              https://ndmuamcrsozbhavnohle.supabase.co/cadastro/{churchSlug}
            </code>
          </Section>

          <Link
            href={`https://ndmuamcrsozbhavnohle.supabase.co/igreja/${churchSlug}`}
            target="_blank"
            style={button}
          >
            Acessar Painel da Igreja
          </Link>

          <Text style={text}>
            <strong>Próximos passos:</strong>
          </Text>
          <Text style={text}>
            1. Personalize as informações da sua igreja<br />
            2. Convide membros usando o link acima<br />
            3. Configure trilhas e devocionais<br />
            4. Explore o dashboard de métricas
          </Text>

          <Text style={text}>
            Dúvidas? Entre em contato conosco pelo email suporte@hodos.com.br
          </Text>

          <Text style={footer}>
            <Link
              href="https://ndmuamcrsozbhavnohle.supabase.co"
              target="_blank"
              style={footerLink}
            >
              Hodos
            </Link>
            {' '}- Transformando igrejas através do discipulado
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeChurch;

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

const highlightBox = {
  backgroundColor: '#f0f4ff',
  borderRadius: '8px',
  border: '2px solid #7b2ff7',
  margin: '24px',
  padding: '20px',
};

const highlightText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '8px 0',
};

const inviteBox = {
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  border: '1px solid #ddd',
  margin: '24px',
  padding: '16px',
};

const inviteLabel = {
  color: '#666',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const code = {
  display: 'block',
  padding: '12px',
  backgroundColor: '#fff',
  borderRadius: '4px',
  border: '1px solid #ddd',
  color: '#7b2ff7',
  fontSize: '14px',
  fontFamily: 'monospace',
  wordBreak: 'break-all' as const,
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
