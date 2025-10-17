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

interface WelcomeIndividualProps {
  userName: string;
  planType: string;
  planName?: string;
  planPrice?: number;
  planFeatures?: string[];
}

export const WelcomeIndividual = ({
  userName,
  planType,
  planName = 'Plano Individual',
  planPrice = 0,
  planFeatures = [],
}: WelcomeIndividualProps) => (
  <Html>
    <Head />
    <Preview>Sua assinatura Hodos foi aprovada! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Bem-vindo ao Hodos!</Heading>
        
        <Text style={text}>Olá, {userName}!</Text>
        
        <Text style={text}>
          Temos ótimas notícias! Sua assinatura do <strong>{planName}</strong> foi aprovada com sucesso.
        </Text>

        {planPrice > 0 && (
          <Section style={priceBox}>
            <Text style={priceText}>
              Plano: <strong>{planName}</strong>
            </Text>
            <Text style={priceText}>
              Valor: <strong>R$ {planPrice.toFixed(2)}/mês</strong>
            </Text>
          </Section>
        )}

        <Section style={highlightBox}>
          <Text style={highlightText}>
            ✅ Sua assinatura está ativa por 30 dias
          </Text>
          {planFeatures && planFeatures.length > 0 ? (
            planFeatures.map((feature, index) => (
              <Text key={index} style={highlightText}>
                ✨ {feature}
              </Text>
            ))
          ) : (
            <>
              <Text style={highlightText}>
                🎯 Acesso completo a trilhas de discipulado
              </Text>
              <Text style={highlightText}>
                📖 Devocionais personalizados
              </Text>
              <Text style={highlightText}>
                📊 Acompanhamento de progresso
              </Text>
            </>
          )}
        </Section>

        <Text style={text}>
          Você já pode acessar sua conta e começar sua jornada espiritual!
        </Text>

        <Link
          href="https://ndmuamcrsozbhavnohle.supabase.co"
          target="_blank"
          style={button}
        >
          Acessar Meu Espaço
        </Link>

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
          {' '}- Sua jornada de fé começa aqui
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeIndividual;

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

const priceBox = {
  backgroundColor: '#fff9e6',
  borderRadius: '8px',
  border: '2px solid #ffa500',
  margin: '24px',
  padding: '16px',
};

const priceText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '4px 0',
  textAlign: 'center' as const,
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
