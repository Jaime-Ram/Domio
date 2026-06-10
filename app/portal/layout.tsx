// De root-layout (app/layout.tsx) levert al <html>/<body> + providers.
// Een tweede <html>/<body> hier veroorzaakt een hydration-mismatch, dus we
// geven de children gewoon door.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
