export default function BeyondLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={` text-primary hover:underline ${className}`}>
      {children}
    </a>
  );
}
