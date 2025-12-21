import { Button as ReactEmailButton } from "@react-email/components";

export const Button = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <ReactEmailButton
      href={href}
      style={{
        backgroundColor: "#002A1F",
        borderRadius: "8px",
        color: "#ffffff",
        fontSize: "16px",
        fontWeight: "600",
        textDecoration: "none",
        textAlign: "center" as const,
        display: "block",
        padding: "12px 24px",
        ...(className?.includes("mt-") && { marginTop: "32px" }),
      }}
    >
      {children}
    </ReactEmailButton>
  );
};




