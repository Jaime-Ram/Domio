import { Container, Html, Preview } from "@react-email/components";
import { Body } from "./components/body";
import { Button } from "./components/button";
import { LeftAligned as Footer } from "./components/footer";
import { Head } from "./components/head";
import { LeftAlignedLinks as Header } from "./components/header";
import { Tailwind } from "./components/tailwind";
import { Text } from "./components/text";

interface EmailVerificationProps {
  userName?: string;
  verificationUrl: string;
  theme?: "light" | "dark";
}

export default function EmailVerification({
  userName = "Gebruiker",
  verificationUrl,
  theme = "light",
}: EmailVerificationProps) {
  return (
    <Html>
      <Tailwind theme={theme}>
        <Head />
        <Preview>Bevestig je email adres voor Domio</Preview>
        <Body>
          <Container align="center" className="w-full max-w-160 bg-primary md:p-8">
            <Header />
            <Container align="left" className="max-w-full px-6 py-8 bg-white">
              <Text className="text-sm text-tertiary md:text-md">
                Hallo {userName},
                <br />
                <br />
                Welkom bij Domio! We zijn blij dat je je hebt aangemeld.
                <br />
                <br />
                Om je account te activeren, moet je eerst je email adres bevestigen. Klik op de onderstaande knop om je email te verifiëren.
                <br />
                <br />
                Als je deze email niet hebt aangevraagd, kun je deze negeren.
                <br />
                <br />
                Met vriendelijke groet,
                <br />
                Het Domio team
              </Text>
              <Button href={verificationUrl} className="mt-8">
                <Text className="text-md font-semibold">Bevestig email adres</Text>
              </Button>
            </Container>
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}





