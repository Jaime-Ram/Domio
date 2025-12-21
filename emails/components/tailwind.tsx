import { Tailwind as ReactEmailTailwind } from "@react-email/components";

export const Tailwind = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme?: "light" | "dark";
}) => {
  return (
    <ReactEmailTailwind
      config={{
        theme: {
          extend: {
            colors: {
              primary: "#002A1F",
              secondary: "#F8FAFC",
              tertiary: "#475569",
            },
          },
        },
      }}
    >
      {children}
    </ReactEmailTailwind>
  );
};




