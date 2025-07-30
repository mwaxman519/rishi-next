import { ThemeToggle } from &quot;../components/ui/theme-toggle&quot;;

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=&quot;bg-[rgb(var(--background))]&quot;>
      <div className=&quot;absolute top-4 right-4 z-10&quot;>
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
