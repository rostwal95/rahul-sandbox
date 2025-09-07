import * as React from 'react';
import { Button, Container, Section, Text } from '@react-email/components';

export default function WelcomeEmail({ name = 'there' }: { name?: string }) {
  return (
    <Container style={{ fontFamily: 'system-ui, -apple-system, Segoe UI' }}>
      <Section>
        <Text style={{ fontSize: 24, fontWeight: 700 }}>Welcome!</Text>
        <Text>Thanks for signing up, {name}.</Text>
        <Button href="https://example.com/start" style={{ background: '#000', color: '#fff', padding: '10px 16px', borderRadius: 12 }}>Get Started</Button>
      </Section>
    </Container>
  );
}
