import { ThemeToggle } from "../components/ui/theme-toggle";

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[rgb(var(--background))]">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
