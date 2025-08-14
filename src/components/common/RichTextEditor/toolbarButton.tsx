export default function ToolbarButton({
  children,
  tooltip,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  tooltip?: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={tooltip}
      onClick={onClick}
      className={`w-8 h-8 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary ${
        isActive
          ? "bg-primary text-white"
          : "bg-bg-base hover:bg-gray-200 border border-gray-300"
      }`}
    >
      {children}
    </button>
  );
}
