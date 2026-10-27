'use client';
import * as React from 'react';
import { Modal } from '../Modal';
import { ModalDialog } from '../ModalDialog';
import { ModalClose } from '../ModalClose';
import { DialogTitle } from '../DialogTitle';
import { DialogContent } from '../DialogContent';
import { Sheet } from '../Sheet';
import { Divider } from '../Divider';
import { Switch } from '../Switch';
import { Button } from '../Button';
import { Link } from '../Link';
import { Typography } from '../Typography';
import { useCookieConsentState } from '../../theme/CookieConsentProvider';
import type { ConsentCategory } from '../../theme/CookieConsentProvider';
import type { CookieConsentLabels } from './types';

interface CookieSettingsDialogProps {
  labels: Required<CookieConsentLabels>;
  privacyHref?: string;
}

export function CookieSettingsDialog({ labels, privacyHref }: CookieSettingsDialogProps) {
  const { settingsOpen, closeSettings } = useCookieConsentState();
  return (
    <Modal open={settingsOpen} onClose={closeSettings}>
      {/* Mounted only while open, so every opening starts from what is
          stored, not from switches someone flipped and then closed. */}
      <SettingsBody labels={labels} privacyHref={privacyHref} />
    </Modal>
  );
}

function SettingsBody({ labels, privacyHref }: CookieSettingsDialogProps) {
  const { consent, categories, save, acceptAll } = useCookieConsentState();
  const [draft, setDraft] = React.useState<Record<string, boolean>>(() => ({ ...consent?.choices }));

  return (
    // The modal's frame pads 16 px on every side; the rest scrolls, because
    // the modal locks the page's own scrolling.
    <ModalDialog className="max-h-[calc(100dvh-32px)] w-full max-w-[520px] gap-5 overflow-y-auto">
      <ModalClose aria-label={labels.close} />
      <div className="flex flex-col gap-2 pr-10">
        <DialogTitle>{labels.settingsTitle}</DialogTitle>
        <DialogContent>{labels.settingsText}</DialogContent>
      </div>
      <Sheet variant="outlined" className="flex flex-col rounded-md">
        {categories.map((category, index) => (
          <React.Fragment key={category.id}>
            {index > 0 && <Divider />}
            <CategoryRow
              category={category}
              alwaysOn={labels.alwaysOn}
              checked={category.required === true || draft[category.id] === true}
              onCheckedChange={(checked) => setDraft((current) => ({ ...current, [category.id]: checked }))}
            />
          </React.Fragment>
        ))}
      </Sheet>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outlined" color="neutral" size="lg" onClick={() => save(draft)}>
          {labels.save}
        </Button>
        <Button variant="solid" color="primary" size="lg" onClick={acceptAll}>
          {labels.acceptAll}
        </Button>
      </div>
      {privacyHref && (
        <Link href={privacyHref} className="self-center text-sm">
          {labels.privacy}
        </Link>
      )}
    </ModalDialog>
  );
}

interface CategoryRowProps {
  category: ConsentCategory;
  alwaysOn: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function CategoryRow({ category, alwaysOn, checked, onCheckedChange }: CategoryRowProps) {
  const nameId = React.useId();
  const descriptionId = React.useId();
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex flex-col gap-0.5">
        <Typography id={nameId} level="title-md">
          {category.label}
        </Typography>
        {category.description != null && (
          <Typography id={descriptionId} level="body-sm" className="text-ink-tertiary">
            {category.description}
          </Typography>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {category.required && (
          <Typography level="body-sm" className="text-ink-tertiary">
            {alwaysOn}
          </Typography>
        )}
        <Switch
          checked={checked}
          disabled={category.required}
          onCheckedChange={onCheckedChange}
          aria-labelledby={nameId}
          aria-describedby={category.description != null ? descriptionId : undefined}
        />
      </div>
    </div>
  );
}
