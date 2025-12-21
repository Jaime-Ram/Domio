import { Body as ReactEmailBody } from "@react-email/components";

export const Body = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactEmailBody style={body}>
      {children}
    </ReactEmailBody>
  );
};

const body = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};




