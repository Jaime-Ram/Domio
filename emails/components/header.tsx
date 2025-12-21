import { Container, Img } from "@react-email/components";

export const LeftAlignedLinks = () => {
  return (
    <Container align="left" style={header}>
      <Img
        src="https://domio.nl/images/DomioLogo.png"
        alt="Domio"
        width="120"
        height="32"
        style={logo}
      />
    </Container>
  );
};

const header = {
  padding: "32px 24px 24px",
  backgroundColor: "#002A1F",
};

const logo = {
  display: "block",
};




