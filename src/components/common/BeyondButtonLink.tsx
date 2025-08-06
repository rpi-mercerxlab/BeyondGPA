/**
 * A Link component styled as a Beyond Button.
 *
 * @param href - The URL to link to.
 * @param children - The content to display inside the button.
 * @param className - Additional CSS classes to apply to the button.
 */
export default function BeyondButtonLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`bg-primary text-white shadow-md inset-shadow-sm hover:bg-bg-base hover:text-primary p-2 rounded-full active:shadow-none transition-colors ${className}`}
    >
      {children}
    </a>
  );
}
