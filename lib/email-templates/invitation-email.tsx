/* eslint-disable react/no-unescaped-entities */
import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Hr,
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

const fontFamily = "Inter, sans-serif";
const logoUrl =
  "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/logo.png";

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
        fontFamily="Inter"
        fallbackFontFamily={["sans-serif"]}
        webFont={{
          url: "https://fonts.gstatic.com/s/inter/v18/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUMbm9wUkHU.woff2",
          format: "woff2",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <style>
        {`
            @media only screen and (max-width: 600px) {
              .heading {
                font-size: 18px !important;
                line-height: 1.25 !important;
              }
              .sub-heading {
                font-size: 14px !important;
                line-height: 1.25 !important;
              }
              .body-text {
                font-size: 13px !important;
                line-height: 1.4 !important;
              }
              .button-text {
                font-size: 14px !important;
                padding: 10px 24px !important;
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
    <Tailwind
      config={
        {
          theme: {
            extend: {
              colors: {
                btnBlue: "#1547E6",
                gold: "#e5a50b",
              },
            },
          },
        } as any
      }
    >
      <Body className="bg-[#ffffff]" style={{ margin: 0, padding: 0 }}>
        <Container className="mx-auto -mt-2 flex flex-col items-stretch">
          <Container>
            <Img
              src={logoUrl}
              height="48"
              alt="Mailer"
              className="mx-auto mt-6 mb-4 block"
            />
          </Container>
          <Container className="pb-12-responsive mt-0 mb-10 flex w-full flex-col px-4 py-8">
            <Text
              className="heading mt-2 text-3xl font-bold"
              style={{ fontFamily, color: "#000000", textAlign: "center" }}
            >
              You've been invited to join {organizationName}!
            </Text>
            <Text
              className="body-text mt-4 text-lg"
              style={{ fontFamily, color: "#000000", textAlign: "left" }}
            >
              {inviterName} has invited you to join their organization as a{" "}
              <strong>{role}</strong>. Join the team and start collaborating on
              beautiful email campaigns together.
            </Text>
            <Container className="mt-10">
              <Container
                className="rounded-lg border border-solid border-[#D4D4D4] bg-white p-4"
                style={{ borderWidth: 2 }}
              >
                <Text
                  className="sub-heading text-xl font-bold uppercase"
                  style={{
                    fontFamily,
                    color: "#000000",
                    textAlign: "center",
                    margin: "12px 0 8px 0",
                  }}
                >
                  Join the team
                </Text>
                <Hr style={{ borderColor: "#D4D4D4", margin: "0 0 8px 0" }} />
                <Text
                  className="notice text-lg italic"
                  style={{
                    fontFamily,
                    color: "#000000",
                    textAlign: "left",
                    margin: "0 0 16px 0",
                  }}
                >
                  Click the button below to accept your invitation and get
                  started.
                </Text>
                <Container style={{ textAlign: "center", marginBottom: 16 }}>
                  <Button
                    className="button-text inline-block rounded-lg px-8 py-2.5 text-base whitespace-nowrap text-white"
                    style={{
                      backgroundColor: "#1547E6",
                      padding: "10px 32px",
                      fontSize: 16,
                    }}
                    href={inviteUrl}
                    type="submit"
                  >
                    Accept Invitation
                  </Button>
                </Container>
                {expiresAt && (
                  <Text
                    className="notice text-sm"
                    style={{
                      fontFamily,
                      color: "#000000",
                      textAlign: "left",
                      margin: "0 0 16px 0",
                    }}
                  >
                    This invitation expires on{" "}
                    {new Date(expiresAt).toLocaleDateString()}
                  </Text>
                )}
                <Text
                  className="notice text-lg italic"
                  style={{ fontFamily, color: "#000000", textAlign: "left" }}
                >
                  If that button doesn't work, copy & paste this link in your
                  browser:
                  <br />
                  <a
                    href={inviteUrl}
                    className="underline"
                    style={{ color: "#000000" }}
                  >
                    {inviteUrl}
                  </a>
                </Text>
              </Container>
            </Container>
            <Container className="container-responsive mt-4 mb-10 self-center text-center text-3xl">
              <Text
                className="body-text"
                style={{ fontFamily, color: "#000000" }}
              >
                We're excited to have you on the team.
              </Text>
              <Text
                className="font-bold"
                style={{ fontFamily, color: "#000000" }}
              >
                – The Mailer Team
              </Text>
            </Container>
          </Container>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default InvitationEmail;
