import Checkbox from 'components/checkbox';
import RadioButton from 'components/radioButton';
import { useEffect, useRef, useState } from 'react';
import * as strings from './strings';
import type { FormData } from './types';
import { useUser } from 'contexts/useUser';
import { useBoolean, useOnClickOutside } from 'usehooks-ts';
import { useFloating, autoUpdate, offset, flip, size, FloatingPortal } from '@floating-ui/react';
import ChipsOverflow from 'components/chipsOverflow';
import { useMailGroupSuggestions } from 'api/hooks/useMailGroupSuggestions';

interface MidurFormFieldProps {
  handleInputChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  mailGroups: string[] | undefined;
  midur: boolean;
  error?: string;
  extraMidur?: boolean;
  isParentExtraMidur: boolean;
}

export const MidurFormField = ({
  handleInputChange,
  mailGroups,
  midur,
  extraMidur,
  isParentExtraMidur,
}: MidurFormFieldProps) => {
  const { user } = useUser();
  const username = user.adfsUser;

  const [midurInput, setMidurInput] = useState('');
  const [debouncedMidurInput, setDebouncedMidurInput] = useState('');

  const {
    value: isOpen,
    setTrue: openDropdown,
    setFalse: closeDropdown,
  } = useBoolean(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: open => {
      if (!open) closeDropdown();
    },
    middleware: [
      offset(10),
      flip({
        fallbackPlacements: ['top', 'bottom'],
      }),
      size({
        apply({ elements }) {
          Object.assign(elements.floating.style, {
            width: '250px',
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
  });

  useOnClickOutside(
    {
      current: dropdownRef.current || triggerRef.current,
    } as React.RefObject<HTMLElement>,
    event => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedMidurInput(midurInput.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [midurInput]);

  const {
    data: suggestions = [],
    isFetching,
    error: suggestionsError,
  } = useMailGroupSuggestions({
    query: debouncedMidurInput,
    username,
  });

  useEffect(() => {
    if (debouncedMidurInput.length < 3) {
      closeDropdown();
      return;
    }

    if (suggestions.length > 0) {
      openDropdown();
    } else {
      closeDropdown();
    }
  }, [debouncedMidurInput, suggestions.length, openDropdown, closeDropdown]);

  useEffect(() => {
    if (suggestionsError) {
      console.error('Failed to load mail group suggestions');
    }
  }, [suggestionsError]);

  const shouldShowDropdown =
    isOpen && debouncedMidurInput.length >= 3 && suggestions.length > 0;

  const handleSelectOption = (group: string) => {
    if (!mailGroups?.includes(group)) {
      handleInputChange('mailGroups', [...(mailGroups || []), group]);
    }

    setMidurInput('');
    setDebouncedMidurInput('');
    closeDropdown();
  };

  const handleMailGroupChipDelete = (group: string) => {
    handleInputChange(
      'mailGroups',
      mailGroups?.filter(value => value !== group)
    );
  };

  return (
    <div className="drawer-form-field">
      <div className="drawer-form-label top-label">{strings.midurLabel}</div>

      <div className="midur-section">
        <div className="midur-guidelines">
          <p className="midur-guidelines-text">{strings.midurGuidelines}</p>
        </div>

        <Checkbox
          checked={!!midur}
          onChange={() => handleInputChange('midur', !midur)}
          label={strings.midurHardeningLabel}
          className="midur-hardening-toggle"
          disabled={isParentExtraMidur}
        />

        {midur && (
          <>
            <p className="midur-hardening-note">{strings.midurHardeningDisclaimer}</p>

            <div className="midur-type-row">
              <span className="midur-type-label">{strings.midurTypeLabel}</span>
              <RadioButton checked label={strings.midurTypeEntry} disabled />
              <RadioButton
                checked={!extraMidur}
                onChange={() => handleInputChange('extraMidur', !extraMidur)}
                label={strings.midurTypeAdvanced}
                disabled={isParentExtraMidur}
              />
            </div>

            <div className="midur-guidelines">
              <p className="midur-guidelines-text">{strings.midurMessage}</p>
            </div>

            <div className="midur-chip-list">
              {mailGroups && (
                <ChipsOverflow
                  items={mailGroups.map(g => ({ label: g, value: g }))}
                  showImage={false}
                  lines={3}
                  onRemove={(item) => handleMailGroupChipDelete(item.label)}
                  enableOverflowDropDown
                />
              )}

              <input
                ref={(node) => {
                  refs.setReference(node);
                  triggerRef.current = node;
                }}
                className="midur-chip-input"
                placeholder={!mailGroups?.length ? strings.mailGroupsPlaceholder : undefined}
                value={midurInput}
                onChange={(e) => setMidurInput(e.target.value)}
              />

              {shouldShowDropdown && (
                <FloatingPortal>
                  <div
                    ref={(node) => {
                      refs.setFloating(node);
                      dropdownRef.current = node;
                    }}
                    style={floatingStyles}
                    className="chips-input-dropdown"
                  >
                    {isFetching && (
                      <div className="chips-input-option">טוען...</div>
                    )}

                    {!isFetching &&
                      suggestions.map((opt, i) => (
                        <div
                          key={`${opt}-${i}`}
                          className="chips-input-option"
                          onClick={() => handleSelectOption(opt)}
                        >
                          {opt}
                        </div>
                      ))}
                  </div>
                </FloatingPortal>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};