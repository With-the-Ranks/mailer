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

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://app.localhost:3000";

export const WelcomeTemplate = () => (
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
          @font-face {
            font-family: Passion One;
            font-style: normal;
            font-weight: 400;
            font-display: swap;
            src: url('https://fonts.cdnfonts.com/s/15566/PassionOne-Regular.woff') format('woff');
            mso-font-alt: Georgia;
          }

          @font-face {
            font-family: Roboto;
            font-style: normal;
            font-weight: 400;
            font-display: swap;
            src: url('https://fonts.cdnfonts.com/s/12165/Roboto-Regular.woff2') format('woff2');
            mso-font-alt: Arial;
          }
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
    <Tailwind config={{ theme: { extend: { colors: { brand: "#107FE5" } } } }}>
      <Body className="bg-[#1E90FF]" style={{ margin: 0, padding: 0 }}>
        <Container className="container-responsive mx-auto -mt-2 flex flex-col items-stretch">
          <Container>
            <Img
              src="https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/xWeI0TM-GpziuotvjNV9MZnAaazSEJdQvKvsHP.png"
              className="mt-10 w-full max-w-full rounded-t-[24px]"
              alt="Bernie Sanders & AOC"
            />
          </Container>
          <Container className="bg-brand pb-12-responsive container-responsive mt-0 flex w-full flex-col px-8 pb-12">
            <Text
              className="heading mt-2 text-3xl font-bold text-white"
              // style={{ fontFamily: '"Passion One", Georgia' }}
              style={{ fontFamily: "Georgia" }}
            >
              Welcome to Mailer — email built for organizers
            </Text>
            <Text
              className="body-text text-lg text-white"
              style={{ fontFamily: '"Roboto", Arial' }}
            >
              Mailer is an open source tool by With The Ranks, built to make
              sending beautiful, effective emails simple — especially for
              organizers with limited time or technical resources.
            </Text>
            <Text
              className="body-text text-xl font-bold text-white"
              style={{ fontFamily: '"Roboto", Arial' }}
            >
              Here’s what to expect:
            </Text>
            <Container className="container-responsive mt-6 flex flex-col items-center self-stretch rounded-[40px] border border-solid border-zinc-400 bg-white px-4 py-8 text-center shadow-sm">
              <Container className="bg-brand flex h-[3px] flex-col self-stretch" />
              <Text
                className="text-brand sub-heading mt-2 text-xl font-bold uppercase"
                // style={{ fontFamily: '"Passion One", Georgia' }}
                style={{ fontFamily: "Georgia" }}
              >
                Designed for Organizers
              </Text>
              <Container className="bg-brand mt-2 flex h-[3px] flex-col self-stretch" />
              <Container className="text-brand text-center">
                <Text style={{ fontFamily: '"Roboto", Arial' }}>
                  Mailer makes it easy to send emails that look great and drive
                  action — without needing a design team or complex tools.
                </Text>

                <ul className="pl-6 text-left">
                  <li>
                    <Text className="ml-2">
                      Intuitive editor built for organizers — no design
                      experience required
                    </Text>
                  </li>
                  <li>
                    <Text className="ml-2">
                      Custom fields and filters for smart audience targeting
                    </Text>
                  </li>
                  <li>
                    <Text>
                      Clear analytics to help you track performance and improve
                      results
                    </Text>
                  </li>
                </ul>
                <Text
                  className="notice mt-6 text-lg italic text-zinc-700"
                  style={{ fontFamily: '"Roboto", Arial' }}
                >
                  Mailer is currently in pre‑alpha. Things may change — and your
                  feedback helps shape what’s next.
                </Text>
              </Container>
              <Button
                className="button-text mt-4 w-5/6 items-center justify-center whitespace-nowrap rounded-[100px] bg-red-500 px-6 py-4 text-center text-2xl uppercase text-white"
                href={baseUrl}
                type="submit"
              >
                Get Started
              </Button>
            </Container>
            <Container className="container-responsive mb-10 mt-4 self-center text-center text-3xl text-white">
              <Text
                className="body-text"
                style={{ fontFamily: '"Roboto", Arial' }}
              >
                Thanks for joining us on this journey.
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

export default WelcomeTemplate;
