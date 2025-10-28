/* eslint-disable react/no-unescaped-entities */
import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Html,
  Img,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface InvitationEmailProps {
  inviteUrl: string;
  organizationName: string;
  inviterName: string;
  role: string;
  expiresAt?: Date | null;
}

export const InvitationEmail = ({
  inviteUrl,
  organizationName,
  inviterName,
  role,
  expiresAt,
}: InvitationEmailProps) => (
  <Html>
    <Head>
      <Font
        fontFamily="Passion One"
        fallbackFontFamily={["Georgia", "sans-serif"]}
        webFont={{
          url: "https://fonts.cdnfonts.com/s/15566/PassionOne-Regular.woff",
          format: "woff",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="Roboto"
        fallbackFontFamily={["Arial", "sans-serif"]}
        webFont={{
          url: "https://fonts.cdnfonts.com/s/12165/Roboto-Regular.woff2",
          format: "woff2",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <style>
        {`
            @media only screen and (max-width: 600px) {
              .heading {
                font-size: 22px !important;
                line-height: 1.2 !important;
              }
              .sub-heading {
                font-size: 16px !important;
                line-height: 1.2 !important;
              }
              .body-text {
                font-size: 14px !important;
                line-height: 1.4 !important;
              }
              .button-text {
                font-size: 18px !important;
                padding: 12px 24px !important;
                line-height: 1.4 !important;
              }
              .pb-12-responsive {
                padding-bottom: 24px !important;
              }
              .notice {
                font-size: 11px !important;
                line-height: 1.4 !important;
            }
          `}
      </style>
    </Head>
    <Preview>You've been invited to join {organizationName}</Preview>
    <Tailwind config={{ theme: { extend: { colors: { brand: "#252753" } } } } as any}>
      <Body className="bg-[#ffffff]" style={{ margin: 0, padding: 0 }}>
        <Container className="mx-auto -mt-2 flex flex-col items-stretch">
          <Container>
            <Img
              src={`https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/V9V9woJ-p15PivASjXuq5gIW6xpgCb6Pes69i3.png`}
              height="35"
              alt="Mailer"
              className="mx-auto mb-4 mt-6"
            />
            <Img
              src="https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/xWeI0TM-GpziuotvjNV9MZnAaazSEJdQvKvsHP.png"
              className="mt-6 max-h-[300px] w-full max-w-full rounded-[24px]  object-cover object-top"
              alt="WTR"
            />
          </Container>
          <Container className="text-brand pb-12-responsive mb-10 mt-0 flex w-full flex-col py-8">
            <Text
              className="heading mt-2 text-3xl font-bold"
              style={{ fontFamily: "Georgia" }}
            >
              You've been invited to join {organizationName}!
            </Text>
            <Text
              className="body-text text-lg"
              style={{ fontFamily: '"Roboto", Arial' }}
            >
              {inviterName} has invited you to join their organization as a{" "}
              <strong>{role}</strong>. Join the team and start collaborating on
              beautiful email campaigns together.
            </Text>
            <Container className="px-8">
              <Container className="border-brand mt-10 flex flex-col items-center self-stretch rounded-[40px] border border-solid bg-white px-4 py-8 text-center shadow-sm">
                <Container className="bg-brand flex h-[3px] flex-col self-stretch" />
                <Text
                  className="text-brand sub-heading mt-2 text-xl font-bold uppercase"
                  style={{ fontFamily: "Georgia" }}
                >
                  Join the team
                </Text>
                <Container className="bg-brand mt-2 flex h-[3px] flex-col self-stretch" />
                <Container className="text-brand text-center">
                  <Text
                    className="notice mt-6 text-lg italic "
                    style={{ fontFamily: '"Roboto", Arial' }}
                  >
                    Click the button below to accept your invitation and get
                    started.
                  </Text>
                </Container>
                <Button
                  className="button-text bg-brand mt-4 w-5/6 items-center justify-center whitespace-nowrap rounded-[100px] px-6 py-4 text-center text-2xl uppercase text-white"
                  href={inviteUrl}
                  type="submit"
                >
                  Accept Invitation
                </Button>
                {expiresAt && (
                  <Text
                    className="notice mt-4 text-sm"
                    style={{ fontFamily: '"Roboto", Arial' }}
                  >
                    This invitation expires on{" "}
                    {new Date(expiresAt).toLocaleDateString()}
                  </Text>
                )}
                <Text
                  className="notice mt-6 text-lg italic"
                  style={{ fontFamily: '"Roboto", Arial' }}
                >
                  If that button doesn't work, copy & paste this link in your
                  browser:
                  <br />
                  <a href={inviteUrl} className="underline">
                    {inviteUrl}
                  </a>
                </Text>
              </Container>
            </Container>
            <Container className="container-responsive text-brand mb-10 mt-4 self-center text-center text-3xl">
              <Text
                className="body-text"
                style={{ fontFamily: '"Roboto", Arial' }}
              >
                We're excited to have you on the team.
              </Text>
              <Text className="font-bold" style={{ fontFamily: "Georgia" }}>
                – With The Ranks Team
              </Text>
            </Container>
          </Container>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default InvitationEmail;
