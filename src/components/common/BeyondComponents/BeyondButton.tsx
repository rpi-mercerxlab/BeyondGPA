export default function BeyondButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-primary text-white shadow-md inset-shadow-sm hover:bg-bg-base-100 hover:text-primary p-2 rounded-full active:shadow-none transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
