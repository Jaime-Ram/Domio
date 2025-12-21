import { Text as ReactEmailText } from "@react-email/components";

export const Text = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const isSmall = className?.includes("text-sm");
  const isMedium = className?.includes("text-md");
  
  return (
    <ReactEmailText
      style={{
        fontSize: isSmall ? "14px" : isMedium ? "16px" : "16px",
        lineHeight: "24px",
        color: "#0F172A",
        margin: "0",
      }}
    >
      {children}
    </ReactEmailText>
  );
};




