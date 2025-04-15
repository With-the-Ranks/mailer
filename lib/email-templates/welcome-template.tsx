import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
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

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://app.localhost:3000";

const defaultSteps = [
  {
    id: 1,
    Description: (
      <li key={1}>
        <strong>Start your campaign.</strong> <Link>Create a new campaign</Link>{" "}
        or use a template.
      </li>
    ),
  },
  {
    id: 2,
    Description: (
      <li key={2}>
        <strong>Track your performance.</strong>{" "}
        <Link>View your campaign metrics</Link> and adjust as needed.
      </li>
    ),
  },
  {
    id: 3,
    Description: (
      <li key={3}>
        <strong>Optimize your outreach.</strong> <Link>Use our tools</Link> to
        reach a wider audience.
      </li>
    ),
  },
];

const defaultLinks = ["Help Center", "Contact Support", "Upgrade Plan"];

export const WelcomeTemplate = ({
  steps = defaultSteps,
  links = defaultLinks,
  email,
}: EmailCampaignProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Mailer</Preview>
      <Tailwind
        config={{ theme: { extend: { colors: { brand: "#123456" } } } }}
      >
        <Body className="bg-gray-100 text-gray-800">
          <Container className="bg-white p-6">
            <Img
              src={`https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/V9V9woJ-p15PivASjXuq5gIW6xpgCb6Pes69i3.png`}
              width="50"
              alt="Mailer"
              className="mx-auto mb-4"
            />
            <Heading className="text-center">Welcome to Mailer</Heading>
            <Text className="mb-4 text-left">Howdy {email || "friend"},</Text>
            <Text className="mb-4 text-left">
              Join other non-profits who trust Mailer for their email campaigns.
            </Text>
            <Text className="mb-4">Here’s how to get started:</Text>
            <ul>{steps.map(({ Description }) => Description)}</ul>
            <Section className="mt-4 text-center">
              <Button href={baseUrl} className="bg-brand px-4 py-2 text-white">
                Go to your dashboard
              </Button>
            </Section>
            <Section className="mt-6 text-center">
              {links.map((link, index) => (
                <Link key={index} className="mx-2 text-blue-500 underline">
                  {link}
                </Link>
              ))}
            </Section>
          </Container>
          <Container className="mt-4 text-center">
            <Link className="text-sm text-gray-500">Unsubscribe</Link>
            <Text className="mt-2 text-xs text-gray-400">
              Mailer, 123 Main Street, Anytown, USA
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeTemplate;
