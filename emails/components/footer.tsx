import { Container, Text } from "@react-email/components";

export const LeftAligned = () => {
  return (
    <Container align="left" style={footer}>
      <Text style={footerText}>
        Domio - Alles-in-één vastgoedbeheerplatform voor vastgoedbeheerders en vastgoedhouders
        <br />
        © {new Date().getFullYear()} Domio. Alle rechten voorbehouden.
      </Text>
    </Container>
  );
};

const footer = {
  padding: "32px 24px",
  backgroundColor: "#F8FAFC",
};

const footerText = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#475569",
  margin: "0",
};




