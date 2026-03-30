import { useRef, useState, useEffect, useCallback } from 'react';
import { useBoolean, useOnClickOutside } from 'usehooks-ts';
import { useDisplaySettings } from 'contexts/useDisplaySettings';
import { useUser } from 'contexts/useUser';
import SettingsMenuDropdown from './settingsMenuDropdown';
import * as strings from './strings';
import './styles.scss';
import Chevron from 'components/chevron';
import type { Option } from 'types/constants';

export default function SettingsButton() {
  const { user } = useUser();
  const { displaySettings, updateDisplaySettings } = useDisplaySettings();
  const { value: isOpen, toggle: toggleMenu } = useBoolean(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [tempSettings, setTempSettings] = useState(displaySettings);

  const hasActiveSettings =
    Object.values(displaySettings).some(value =>
      typeof value === 'boolean' ? value : Array.isArray(value) && value.length,
    ) || Object.values(displaySettings.highlights).some(arr => arr && arr.length);

  useEffect(() => {
    setTempSettings(displaySettings);
  }, [displaySettings]);

  const handleMenuClick = useCallback(() => {
    toggleMenu();
  }, [toggleMenu]);

  const handleCheckboxChange = useCallback(
    (key: keyof typeof tempSettings) => {
      setTempSettings(prev => {
        const newSettings = {
          ...prev,
          [key]: !prev[key],
        };

        updateDisplaySettings(newSettings);
        return newSettings;
      });
    },
    [updateDisplaySettings],
  );

  const handleHighlightChange = useCallback(
    (type: 'zira' | 'meaning' | 'systems', values: Option[]) => {
      setTempSettings(prev => {
        const newSettings = {
          ...prev,
          highlights: {
            ...prev.highlights,
            [type]: values,
          },
        };

        updateDisplaySettings(newSettings);
        return newSettings;
      });
    },
    [updateDisplaySettings],
  );

  useOnClickOutside(
    [dropdownRef, buttonRef] as React.RefObject<HTMLElement>[],
    event => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        toggleMenu();
      }
    },
  );

  return (
    <div className="settings-button-container">
      <button
        ref={buttonRef}
        className="settings-button"
        onClick={handleMenuClick}
        title={strings.settingsMenuTitle}
      >
        {hasActiveSettings && <span className="settings-button-indicator" />}

        <svg width="14.94" height="12.15" viewBox="0 0 14.94 12.15">
          <path
            fill="currentColor"
            d="M8.86,12.15H6.07c-.76,0-1.5-.5-1.58-.8.84,0,.68,0,1.93,1.1,6.07,0H8.86C11.62,0,13,0,14.15,1.2,35,1.5,11,0,4.15-1.5,11-2.34,1-5.11,186,68.1C-2.49,0,3.73,0,4.43,0Z"
          />
          <path
            fill="currentColor"
            d="M8.88,2.31h2.56a.8.8,0,0,1,.8.8v4.63a.8.8,0,0,1-.8.8H8.88a.8.8,0,0,1-.8-.8V3.11A.8.8,0,0,1,8.88,2.31ZM6.14.5,5.5,0,0,1,.5,5v.5a.5.5,0,0,1-.5.5H3a.5.5,0,0,1-.5-.5v-.5a.5.5,0,0,1,.5-.5H3.64A.5.5,0,0,0,4.14,4V1A.5.5,0,0,0,3.64.5Z"
          />
        </svg>

        <span className="settings-button-text">{strings.displaySettingsTitle}</span>

        <Chevron isOpen={isOpen} alwaysDown />
      </button>

      {isOpen && (
        <SettingsMenuDropdown
          dropdownRef={dropdownRef}
          tempSettings={tempSettings}
          isAdmin={user?.isAdmin || false}
          isGardner={user?.isGardner || false}
          onCheckboxChange={handleCheckboxChange}
          onHighlightChange={handleHighlightChange}
        />
      )}
    </div>
  );
}