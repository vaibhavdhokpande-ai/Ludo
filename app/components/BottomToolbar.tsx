"use client";

interface BottomToolbarProps {
  onRoll: () => void;
  onHome: () => void;
  canRoll: boolean;
  rolling: boolean;
}

function ToolbarButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-transform xs:h-12 xs:w-12 sm:h-14 sm:w-14 ${
        disabled ? "opacity-50" : "active:scale-95"
      }`}
      style={{
        border: "2.5px solid #F5B400",
        background: "linear-gradient(180deg, #fff6da 0%, #f7e2a8 100%)",
        boxShadow: "0 3px 0 #8C6300, 0 5px 10px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </button>
  );
}

export default function BottomToolbar({
  onRoll,
  onHome,
  canRoll,
  rolling,
}: BottomToolbarProps) {
  return (
    <div className="flex w-full flex-shrink-0 items-center justify-between px-1 xs:px-2">
      <ToolbarButton onClick={undefined}>
        <i
          className="ti ti-mood-smile text-[18px] text-amber-700 xs:text-[20px] sm:text-[24px]"
          aria-hidden="true"
        />
      </ToolbarButton>

      <button
        onClick={onRoll}
        disabled={!canRoll || rolling}
        aria-label="Roll dice"
        className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl transition-transform xs:h-16 xs:w-16 sm:h-20 sm:w-20 ${
          !canRoll || rolling ? "opacity-50" : "active:scale-95"
        } ${canRoll && !rolling ? "pulse-ring" : ""}`}
        style={{
          background: "radial-gradient(circle at 35% 30%, #2a2a2a 0%, #0a0a0a 70%)",
          boxShadow: "0 4px 0 #000, 0 7px 14px rgba(0,0,0,0.5)",
        }}
      >
        <i
          className={`ti ti-dice-5-filled text-[26px] text-white xs:text-[30px] sm:text-[36px] ${
            rolling ? "animate-spin" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <ToolbarButton onClick={onHome}>
        <i
          className="ti ti-settings-filled text-[18px] text-amber-700 xs:text-[20px] sm:text-[24px]"
          aria-hidden="true"
        />
      </ToolbarButton>
    </div>
  );
}
