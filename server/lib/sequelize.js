import Checkbox from 'components/checkbox';
import ChipsInput from 'components/chipsInput';
import type { Option } from 'types/constants';

interface SettingsFieldWithChipsProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  isAdmin: boolean;
  highlightLabel: string;
  highlightValues: Option[];
  highlightOptions: Option[];
  onHighlightChange: (values: Option[]) => void;
  placeholder: string;
}

export default function SettingsFieldWithChips({
  label,
  checked,
  onChange,
  isAdmin,
  highlightLabel,
  highlightValues,
  highlightOptions,
  onHighlightChange,
  placeholder,
}: SettingsFieldWithChipsProps) {
  return (
    <div className="settings-field-group">
      <Checkbox
        checked={checked}
        onChange={onChange}
        label={label}
        className="settings-checkbox-item"
      />

      {/* חשוב: לאפשר שינוי גם כשה-checkbox מסומן בלבד */}
      {checked && isAdmin && (
        <ChipsInput
          label={highlightLabel}
          selectedOptions={highlightValues}
          availableOptions={highlightOptions}
          onChange={onHighlightChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}