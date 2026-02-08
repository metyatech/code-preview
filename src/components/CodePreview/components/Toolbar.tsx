import { ResetButton } from "./ResetButton";
import { ToolbarButton } from "./ToolbarButton";

interface ToolbarProps {
  resetProgress: number;
  showLineNumbers: boolean;
  showFileStructure: boolean;
  onResetMouseDown: () => void;
  onResetMouseUp: () => void;
  onResetMouseLeave: () => void;
  onToggleLineNumbers: () => void;
  onToggleFileStructure: () => void;
}

export const Toolbar = ({
  resetProgress,
  showLineNumbers,
  showFileStructure,
  onResetMouseDown,
  onResetMouseUp,
  onResetMouseLeave,
  onToggleLineNumbers,
  onToggleFileStructure,
}: ToolbarProps) => {
  return (
    <>
      <ResetButton
        resetProgress={resetProgress}
        onMouseDown={onResetMouseDown}
        onMouseUp={onResetMouseUp}
        onMouseLeave={onResetMouseLeave}
      />
      <ToolbarButton
        onClick={onToggleLineNumbers}
        pressed={showLineNumbers}
        label={showLineNumbers ? "行番号を隠す" : "行番号を表示"}
        icon="#"
      />
      <ToolbarButton
        onClick={onToggleFileStructure}
        pressed={showFileStructure}
        label={showFileStructure ? "ファイル構造を隠す" : "ファイル構造を表示"}
        icon="📁"
      />
    </>
  );
};
