import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface EmailCampaignProps {
  steps?: {
    id: number;
    Description: React.ReactNode;
  }[];
  links?: string[];
  email?: string;
}

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://app.localhost:3000";

const defaultSteps = [
  {
    id: 1,
    Description: (
      <li key={1}>
        <strong>Start your campaign.</strong> <Link>Create a new campaign</Link> or use a template.
      </li>
    ),
  },
  {
    id: 2,
    Description: (
      <li key={2}>
        <strong>Track your performance.</strong> <Link>View your campaign metrics</Link> and adjust as needed.
      </li>
    ),
  },
  {
    id: 3,
    Description: (
      <li key={3}>
        <strong>Optimize your outreach.</strong> <Link>Use our tools</Link> to reach a wider audience.
      </li>
    ),
  },
];

const defaultLinks = ["Help Center", "Contact Support", "Upgrade Plan"];

export const WelcomeTemplate = ({
  steps = defaultSteps,
  links = defaultLinks,
  email
}: EmailCampaignProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Intrepid</Preview>
      <Tailwind config={{ theme: { extend: { colors: { brand: "#123456" } } } }}>
        <Body className="bg-gray-100 text-gray-800">
          <Container className="bg-white p-6">
            <Img src={`${baseUrl}/logo-square.png`} width="150" alt="Intrepid" className="mx-auto mb-4" />
            <Heading className="text-center">Welcome to Intrepid</Heading>
            <Text className="text-left mb-4">
              Howdy {email || "friend"},
            </Text>
            <Text className="text-left mb-4">
              Join other non-profits who trust Intrepid for their email campaigns.
            </Text>
            <Text className="mb-4">Here’s how to get started:</Text>
            <ul>{steps.map(({ Description }) => Description)}</ul>
            <Section className="text-center mt-4">
              <Button href={baseUrl} className="bg-brand text-white py-2 px-4">Go to your dashboard</Button>
            </Section>
            <Section className="mt-6 text-center">
              {links.map((link, index) => (
                <Link key={index} className="text-blue-500 underline mx-2">{link}</Link>
              ))}
            </Section>
          </Container>
          <Container className="mt-4 text-center">
            <Link className="text-sm text-gray-500">Unsubscribe</Link>
            <Text className="text-xs text-gray-400 mt-2">Intrepid, 123 Main Street, Anytown, USA</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeTemplate;
