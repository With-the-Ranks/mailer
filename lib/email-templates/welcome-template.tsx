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

import { getBaseAppUrl } from "@/lib/utils";

const baseUrl = getBaseAppUrl();
const fontFamily = "Inter, sans-serif";
const logoUrl =
  "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/logo.png";

export const WelcomeTemplate = () => (
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
            .container-responsive {
              padding-left: 16px !important;
              padding-right: 16px !important;
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
    <Preview>Welcome to Mailer — email built for organizers</Preview>
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
        <Container className="container-responsive mx-auto -mt-2 flex flex-col items-stretch">
          <Container>
            <Img
              src={logoUrl}
              height="48"
              alt="Mailer"
              className="mx-auto mt-6 mb-4 block"
            />
          </Container>
          <Container className="pb-12-responsive container-responsive mt-0 flex w-full flex-col px-4 pb-12">
            <Text
              className="heading mt-2 text-3xl font-bold"
              style={{ fontFamily, color: "#000000", textAlign: "center" }}
            >
              Welcome to Mailer — email built for organizers
            </Text>
            <Text
              className="body-text mt-4 text-lg"
              style={{ fontFamily, color: "#000000", textAlign: "left" }}
            >
              Mailer is an open source tool by With The Ranks, built to make
              sending beautiful, effective emails simple — especially for
              organizers with limited time or technical resources.
            </Text>
            <Text
              className="body-text mt-4 text-xl font-bold"
              style={{ fontFamily, color: "#000000", textAlign: "left" }}
            >
              Here’s what to expect:
            </Text>
            <Container className="container-responsive mt-6">
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
                  Designed for Organizers
                </Text>
                <Hr style={{ borderColor: "#D4D4D4", margin: "0 0 8px 0" }} />
                <Text
                  style={{
                    fontFamily,
                    color: "#000000",
                    textAlign: "left",
                    margin: "0 0 8px 0",
                  }}
                >
                  Mailer makes it easy to send emails that look great and drive
                  action — without needing a design team or complex tools.
                </Text>

                <ul className="pl-6 text-left" style={{ margin: "0 0 8px 0" }}>
                  <li>
                    <Text
                      className="ml-2"
                      style={{ fontFamily, color: "#000000" }}
                    >
                      Intuitive editor built for organizers — no design
                      experience required
                    </Text>
                  </li>
                  <li>
                    <Text
                      className="ml-2"
                      style={{ fontFamily, color: "#000000" }}
                    >
                      Custom fields and filters for smart audience targeting
                    </Text>
                  </li>
                  <li>
                    <Text style={{ fontFamily, color: "#000000" }}>
                      Clear analytics to help you track performance and improve
                      results
                    </Text>
                  </li>
                </ul>
                <Text
                  className="notice text-lg italic"
                  style={{
                    fontFamily,
                    color: "#000000",
                    textAlign: "left",
                    margin: "0 0 16px 0",
                  }}
                >
                  Mailer is currently in pre‑alpha. Things may change — and your
                  feedback helps shape what’s next.
                </Text>
                <Container style={{ textAlign: "center" }}>
                  <Button
                    className="button-text inline-block rounded-lg px-8 py-2.5 text-base whitespace-nowrap text-white"
                    style={{
                      backgroundColor: "#1547E6",
                      padding: "10px 32px",
                      fontSize: 16,
                    }}
                    href={baseUrl}
                    type="submit"
                  >
                    Get Started
                  </Button>
                </Container>
              </Container>
            </Container>
            <Container className="container-responsive mt-4 mb-10 self-center text-center text-3xl">
              <Text
                className="body-text"
                style={{ fontFamily, color: "#000000" }}
              >
                Thanks for joining us on this journey.
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

export default WelcomeTemplate;
