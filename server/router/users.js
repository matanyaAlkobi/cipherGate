import clsx from 'clsx';
import Checkbox from 'components/checkbox';
import Switch from 'components/switch';
import type { NodeDisplaySettings } from 'contexts/displaySettingsContext';
import SettingsFieldWithChips from './settingsFieldWithChips';
import * as strings from './strings';
import {
  meaningOptions,
  ziraOptions,
  type Option,
} from 'types/constants';

interface SettingsMenuDropdownProps {
  tempSettings: NodeDisplaySettings;
  isAdmin: boolean;
  isGardner: boolean;
  onCheckboxChange: (key: keyof NodeDisplaySettings) => void;
  onHighlightChange: (
    type: 'zira' | 'meaning' | 'systems',
    values: Option[],
  ) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function SettingsMenuDropdown({
  tempSettings,
  isAdmin,
  isGardner,
  onCheckboxChange,
  onHighlightChange,
  dropdownRef,
}: SettingsMenuDropdownProps) {
  return (
    <div
      className={clsx('settings-menu-dropdown', { admin: isAdmin })}
      ref={dropdownRef}
    >
      <div className="settings-menu-content">
        <Checkbox
          checked={tempSettings.showArchived}
          onChange={() => onCheckboxChange('showArchived')}
          label={strings.showArchivedLabel}
          className="settings-checkbox-item"
        />

        <div className="settings-separator" />

        <Checkbox
          checked={tempSettings.showDescription}
          onChange={() => onCheckboxChange('showDescription')}
          label={strings.descriptionLabel}
          className="settings-checkbox-item"
        />

        <div className="settings-field-group">
          <Checkbox
            checked={tempSettings.showIfdur}
            onChange={() => onCheckboxChange('showIfdur')}
            label={strings.ifdurLabel}
            className="settings-checkbox-item"
          />

          {isAdmin && (
            <div className="settings-switch-row settings-checkbox-indented">
              <span className="settings-switch-label">
                {strings.highlightIfdurHardeningLabel}
              </span>

              <Switch
                checked={tempSettings.highlightIfdurHardening}
                onChange={() => onCheckboxChange('highlightIfdurHardening')}
              />
            </div>
          )}
        </div>

        <SettingsFieldWithChips
          label={strings.ziraLabel}
          checked={tempSettings.showZira}
          onChange={() => onCheckboxChange('showZira')}
          isAdmin={isAdmin || isGardner}
          highlightLabel={strings.highlightLabel}
          highlightValues={tempSettings.highlights?.zira || []}
          highlightOptions={ziraOptions}
          onHighlightChange={(values: Option[]) =>
            onHighlightChange('zira', values)
          }
          placeholder={strings.selectZiraPlaceholder}
        />

        {isAdmin || isGardner ? (
          <>
            <SettingsFieldWithChips
              label={strings.meaningLabel}
              checked={tempSettings.showMeaning}
              onChange={() => onCheckboxChange('showMeaning')}
              isAdmin={isAdmin}
              highlightLabel={strings.highlightLabel}
              highlightValues={tempSettings.highlights?.meaning || []}
              highlightOptions={meaningOptions}
              onHighlightChange={(values: Option[]) =>
                onHighlightChange('meaning', values)
              }
              placeholder={strings.selectMeaningPlaceholder}
            />

            <SettingsFieldWithChips
              label={strings.systemsLabel}
              checked={tempSettings.showSystems}
              onChange={() => onCheckboxChange('showSystems')}
              isAdmin={isAdmin}
              highlightLabel={strings.highlightLabel}
              highlightValues={tempSettings.highlights?.systems || []}
              highlightOptions={tempSettings.systemOptions || []}
              onHighlightChange={(values: Option[]) =>
                onHighlightChange('systems', values)
              }
              placeholder={strings.selectSystemsPlaceholder}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}