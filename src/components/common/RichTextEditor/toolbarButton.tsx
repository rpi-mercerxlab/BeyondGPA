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
      className={`px-2 py-1 rounded  ${
        isActive ? "bg-primary text-white" : "bg-bg-base hover:bg-gray-200 border border-gray-300"
      }`}
    >
      {children}
    </button>
  );
}
