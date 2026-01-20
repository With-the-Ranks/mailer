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

export interface VerifyEmailProps {
  verificationUrl: string;
}

const fontFamily = "Inter, sans-serif";
const logoUrl =
  "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/logo.png";

export const VerifyEmail = ({ verificationUrl }: VerifyEmailProps) => (
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
                font-size: 16px !important;
                padding: 10px 32px !important;
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
    <Preview>Welcome to Mailer — verify your email</Preview>
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
              Hey there, welcome to Mailer!
            </Text>
            <Text
              className="body-text mt-4 text-lg"
              style={{ fontFamily, color: "#000000", textAlign: "left" }}
            >
              We're thrilled to have you on board. Let's get your email verified
              so you can start sending beautiful, effective messages.
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
                  You're almost there!
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
                  Thanks for signing up! Click the button below to verify your
                  email.
                </Text>
                <Container style={{ textAlign: "center", marginBottom: 16 }}>
                  <Button
                    className="button-text inline-block rounded-lg px-8 py-2.5 text-base whitespace-nowrap text-white"
                    style={{
                      backgroundColor: "#1547E6",
                      padding: "10px 32px",
                      fontSize: 16,
                    }}
                    href={verificationUrl}
                    type="submit"
                  >
                    Verify your email
                  </Button>
                </Container>
                <Text
                  className="notice text-lg italic"
                  style={{ fontFamily, color: "#000000", textAlign: "left" }}
                >
                  If that button doesn’t work, copy & paste this link in your
                  browser:
                  <br />
                  <a
                    href={verificationUrl}
                    className="underline"
                    style={{ color: "#000000" }}
                  >
                    {verificationUrl}
                  </a>
                </Text>
              </Container>
            </Container>
            <Container className="container-responsive mt-4 mb-10 self-center text-center text-3xl">
              <Text
                className="body-text"
                style={{ fontFamily, color: "#000000" }}
              >
                We're excited to have you with us.
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

export default VerifyEmail;
