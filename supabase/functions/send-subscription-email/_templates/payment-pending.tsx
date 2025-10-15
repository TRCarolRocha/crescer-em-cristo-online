import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PaymentPendingProps {
  userName: string;
  planType: string;
  confirmationCode: string;
}

export const PaymentPending = ({
  userName,
  planType,
  confirmationCode,
}: PaymentPendingProps) => {
  const getPlanName = (type: string) => {
    const names: Record<string, string> = {
      individual: 'Individual',
      church_simple: 'Igreja Simples',
      church_plus: 'Igreja Plus',
      church_premium: 'Igreja Premium',
    };
    return names[type] || type;
  };

  return (
    <Html>
      <Head />
      <Preview>Pagamento registrado - Confirmação em até 24h</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Pagamento Registrado! 📝</Heading>
          
          <Text style={text}>Olá, {userName}!</Text>
          
          <Text style={text}>
            Recebemos seu pagamento para o plano <strong>{getPlanName(planType)}</strong>.
          </Text>
          
          <Text style={text}>
            Seu código de confirmação é:
          </Text>
          
          <div style={codeContainer}>
            <code style={code}>{confirmationCode}</code>
          </div>
          
          <Text style={text}>
            <strong>Próximos passos:</strong>
          </Text>
          
          <Text style={text}>
            • Nossa equipe irá validar seu pagamento em até 24 horas<br />
            • Você receberá um email de confirmação assim que for aprovado<br />
            • Seu acesso será liberado automaticamente após a aprovação
          </Text>
          
          <Text style={text}>
            Guarde este código para referência futura.
          </Text>
          
          <Text style={footer}>
            Equipe Hodos<br />
            <Link href="https://hodos.app" style={link}>hodos.app</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '580px' };
const h1 = { color: '#7b2ff7', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' };
const text = { color: '#333', fontSize: '16px', lineHeight: '24px', marginBottom: '12px' };
const codeContainer = { backgroundColor: '#f4f4f4', borderRadius: '8px', padding: '16px', textAlign: 'center' as const, marginBottom: '20px' };
const code = { fontSize: '24px', fontWeight: 'bold' as const, color: '#7b2ff7', fontFamily: 'monospace' };
const footer = { color: '#999', fontSize: '12px', lineHeight: '18px', marginTop: '32px' };
const link = { color: '#7b2ff7', textDecoration: 'underline' as const };

export default PaymentPending;
