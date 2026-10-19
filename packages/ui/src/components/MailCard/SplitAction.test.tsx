import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoot } from 'react-dom/client';
import { WOHNUNGSGEBER_EXAMPLE } from './examples';
import type { MailCardMessages } from './messages';
import type { CardSpec, MailCardAlternative } from './spec';
import { MailCard, MailCardAction, MailCardFooter } from './index';
import { SplitAction } from './SplitAction';

const MESSAGES = {
  moreActions: 'Weitere Aktionen',
  feedbackYes: 'Ja, das stimmt',
  feedbackNo: 'Nein, das stimmt nicht',
  feedbackThanks: 'Danke für deine Rückmeldung',
} as MailCardMessages;

const ALTERNATIVES: readonly MailCardAlternative[] = [
  {
    label: 'Ausstellen und versenden',
    hint: 'Die Antwort geht ohne weitere Rückfrage an Tobias Maurer.',
    preapprove: ['send_reply'],
  },
  {
    label: 'Ausstellen und als Entwurf speichern',
    hint: 'Die Antwort liegt danach in deinen Entwürfen.',
    preapprove: ['save_draft'],
  },
  { label: 'Nur ausstellen', preapprove: ['issue_only'] },
];

/** The example card, with its primary action replaced by `action`. */
function cardWith(action: object): CardSpec {
  return {
    kind: 'test',
    blocks: [
      { type: 'header', title: 'Titel' },
      { type: 'actions', actions: [action as never] },
    ],
  };
}

const arrow = () => screen.getByRole('button', { name: 'Weitere Aktionen' });

describe('SplitAction in MailCard', () => {
  it('opens the list from the arrow and names it', async () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    expect(arrow()).toHaveAttribute('aria-haspopup', 'menu');
    expect(arrow()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(arrow());

    expect(arrow()).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu', { name: 'Weitere Aktionen' });
    expect(arrow()).toHaveAttribute('aria-controls', menu.id);
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(2);
  });

  it('names each item by its label and describes it with its hint', async () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    await userEvent.click(arrow());

    const item = screen.getByRole('menuitem', { name: 'Ausstellen und versenden' });
    expect(item).toHaveAccessibleDescription(
      'Die Antwort geht ohne weitere Rückfrage an Tobias Maurer.',
    );
    expect(
      screen.getByRole('menuitem', { name: 'Ausstellen und als Entwurf speichern' }),
    ).toHaveAccessibleDescription('Die Antwort liegt danach in deinen Entwürfen.');
  });

  it('shows an alternative without a hint as a label alone', async () => {
    render(
      <MailCard
        spec={cardWith({
          label: 'Starten',
          offer: true,
          primary: true,
          alternatives: [{ label: 'Nur ausstellen', preapprove: ['issue_only'] }],
        })}
        messages={MESSAGES}
      />,
    );
    await userEvent.click(arrow());
    const item = screen.getByRole('menuitem', { name: 'Nur ausstellen' });
    expect(item).not.toHaveAttribute('aria-describedby');
    expect(item).toHaveAccessibleDescription('');
  });

  it('calls onOffer with the chosen alternative and closes', async () => {
    const onOffer = vi.fn();
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} onOffer={onOffer} />);
    await userEvent.click(arrow());

    await userEvent.click(screen.getByRole('menuitem', { name: 'Ausstellen und versenden' }));

    expect(onOffer).toHaveBeenCalledTimes(1);
    expect(onOffer.mock.calls[0][0].preapprove).toEqual(['send_reply']);
    expect(onOffer.mock.calls[0][0]).toEqual(
      expect.objectContaining({ label: 'Ausstellen und versenden' }),
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(arrow()).toHaveAttribute('aria-expanded', 'false');
  });

  it('gives focus back to the arrow after a choice', async () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    await userEvent.click(arrow());
    await userEvent.click(screen.getByRole('menuitem', { name: 'Ausstellen und versenden' }));
    expect(arrow()).toHaveFocus();
  });

  it('calls onOffer without an argument from the main part, and does not open the list', async () => {
    const onOffer = vi.fn();
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} onOffer={onOffer} />);

    await userEvent.click(screen.getByRole('button', { name: 'Bestätigung ausstellen' }));

    expect(onOffer).toHaveBeenCalledTimes(1);
    expect(onOffer).toHaveBeenCalledWith();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the list when the main part is used', async () => {
    const onOffer = vi.fn();
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} onOffer={onOffer} />);
    await userEvent.click(arrow());
    await userEvent.click(screen.getByRole('button', { name: 'Bestätigung ausstellen' }));
    expect(onOffer).toHaveBeenCalledWith();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the list from the arrow when it is open', async () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    await userEvent.click(arrow());
    await userEvent.click(arrow());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(arrow()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on a pointerdown outside', async () => {
    render(
      <div>
        <p>Draußen</p>
        <MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />
      </div>,
    );
    await userEvent.click(arrow());
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await userEvent.pointer({ keys: '[MouseLeft>]', target: screen.getByText('Draußen') });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('stays open on a pointerdown inside the list, so the click can land', async () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    await userEvent.click(arrow());

    await userEvent.pointer({
      keys: '[MouseLeft>]',
      target: screen.getByRole('menuitem', { name: 'Ausstellen und versenden' }),
    });

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('keeps the list inside the card: no portal', async () => {
    const { container } = render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    await userEvent.click(arrow());

    const card = container.firstElementChild as HTMLElement;
    expect(card.contains(screen.getByRole('menu'))).toBe(true);
    // Nothing was appended to <body> beside the render container.
    expect(document.body.children).toHaveLength(1);
  });

  it.each(['open', 'closed'] as const)(
    'works inside a %s shadow root: the choice lands, and an outside pointerdown closes',
    async (mode) => {
      const host = document.createElement('div');
      document.body.append(host);
      const shadow = host.attachShadow({ mode });
      const mount = document.createElement('div');
      shadow.append(mount);
      const onOffer = vi.fn();
      // One instance, so the pressed button is still pressed when the next call releases it.
      const user = userEvent.setup();
      const root = createRoot(mount);
      try {
        await act(async () => {
          root.render(
            <MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} onOffer={onOffer} />,
          );
        });
        const openList = async () => {
          await user.click(shadow.querySelector<HTMLElement>('[aria-haspopup="menu"]')!);
          expect(shadow.querySelector('[role="menu"]')).not.toBeNull();
        };

        // The pointerdown of a choice is "inside", though the document sees only the host as its
        // target, and in a closed root not even the item in its event path. If it counted as
        // outside, the list would close before the click and the choice would be lost.
        await openList();
        const item = shadow.querySelectorAll<HTMLElement>('[role="menuitem"]')[1];
        await user.pointer({ keys: '[MouseLeft>]', target: item });
        expect(shadow.querySelector('[role="menu"]')).not.toBeNull();
        await user.pointer({ keys: '[/MouseLeft]', target: item });
        expect(onOffer).toHaveBeenCalledTimes(1);
        expect(onOffer.mock.calls[0][0].preapprove).toEqual(['save_draft']);
        expect(shadow.querySelector('[role="menu"]')).toBeNull();

        // Opened again, a pointerdown outside closes it; the inside one before did not leave a
        // stale "inside" behind that would swallow this one.
        await openList();
        await user.pointer({ keys: '[MouseLeft]', target: document.body });
        expect(shadow.querySelector('[role="menu"]')).toBeNull();
        expect(onOffer).toHaveBeenCalledTimes(1);
      } finally {
        await act(async () => root.unmount());
        host.remove();
      }
    },
  );

  it('listens in the document the card is in, not in the global one', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const doc = frame.contentDocument!;
    const mount = doc.createElement('div');
    doc.body.append(mount);
    const root = createRoot(mount);
    try {
      await act(async () => {
        root.render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
      });
      await userEvent.click(doc.querySelector<HTMLElement>('[aria-haspopup="menu"]')!);
      expect(doc.querySelector('[role="menu"]')).not.toBeNull();

      await userEvent.pointer({ keys: '[MouseLeft]', target: doc.body });

      expect(doc.querySelector('[role="menu"]')).toBeNull();
    } finally {
      await act(async () => root.unmount());
      frame.remove();
    }
  });

  it('moves focus to the first item when it opens', async () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    await userEvent.click(arrow());
    expect(screen.getByRole('menuitem', { name: 'Ausstellen und versenden' })).toHaveFocus();
  });

  it('closes on Escape and returns focus to the arrow', async () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    await userEvent.click(arrow());
    expect(screen.getByRole('menuitem', { name: 'Ausstellen und versenden' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(arrow()).toHaveFocus();
    expect(arrow()).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps Escape to itself while the list is open, so the host page does not see it', async () => {
    const onKeyDown = vi.fn();
    document.addEventListener('keydown', onKeyDown);
    try {
      render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
      await userEvent.click(arrow());

      await userEvent.keyboard('{Escape}');
      expect(onKeyDown).not.toHaveBeenCalled();

      // Closed again: Escape is not ours to stop.
      await userEvent.keyboard('{Escape}');
      expect(onKeyDown).toHaveBeenCalledTimes(1);
    } finally {
      document.removeEventListener('keydown', onKeyDown);
    }
  });

  it('moves between the items with the arrow keys and wraps around', async () => {
    render(
      <MailCard
        spec={cardWith({
          label: 'Starten',
          offer: true,
          primary: true,
          alternatives: ALTERNATIVES,
        })}
        messages={MESSAGES}
      />,
    );
    await userEvent.click(arrow());
    const [first, second, third] = screen.getAllByRole('menuitem');
    expect(first).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(second).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(third).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(first).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    expect(third).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(second).toHaveFocus();

    await userEvent.keyboard('{Home}');
    expect(first).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(third).toHaveFocus();
  });

  it('chooses the focused item with Enter', async () => {
    const onOffer = vi.fn();
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} onOffer={onOffer} />);
    await userEvent.click(arrow());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onOffer.mock.calls[0][0].preapprove).toEqual(['save_draft']);
  });

  it('closes on Tab from an item and goes on to what follows the card', async () => {
    render(
      <div>
        <MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />
        <button type="button">Danach</button>
      </div>,
    );
    await userEvent.click(arrow());
    expect(screen.getByRole('menuitem', { name: 'Ausstellen und versenden' })).toHaveFocus();

    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Danach' })).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Shift+Tab from an item and goes back to the main part', async () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    await userEvent.click(arrow());
    expect(screen.getByRole('menuitem', { name: 'Ausstellen und versenden' })).toHaveFocus();

    await userEvent.tab({ shift: true });

    expect(screen.getByRole('button', { name: 'Bestätigung ausstellen' })).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(arrow()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when focus moves out some other way', async () => {
    render(
      <div>
        <MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />
        <button type="button">Danach</button>
      </div>,
    );
    await userEvent.click(arrow());
    expect(screen.getByRole('menu')).toBeInTheDocument();

    act(() => screen.getByRole('button', { name: 'Danach' }).focus());

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('highlights one item at a time: the pointer moves the focus onto the item it passes over', async () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    await userEvent.click(arrow());
    const [first, second] = screen.getAllByRole('menuitem');
    expect(first).toHaveFocus();

    await userEvent.hover(second);

    expect(second).toHaveFocus();
    // The highlight is the focus background alone; a hover background of its own would make two.
    for (const item of [first, second]) {
      expect(item).toHaveClass('focus:bg-[var(--mail-card-menu-hover)]');
      expect(item.className).not.toMatch(/(^|\s)hover:/);
    }
  });

  it('shows no arrow for a primary offer without alternatives', () => {
    render(
      <MailCard
        spec={cardWith({ label: 'Starten', offer: true, primary: true })}
        messages={MESSAGES}
      />,
    );
    expect(screen.getByRole('button', { name: 'Starten' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Weitere Aktionen' })).not.toBeInTheDocument();
  });

  it('ignores alternatives on a url action', () => {
    render(
      <MailCard
        spec={cardWith({
          label: 'Ansehen',
          url: 'https://example.com/a',
          primary: true,
          alternatives: ALTERNATIVES,
        })}
        messages={MESSAGES}
      />,
    );
    expect(screen.getByRole('link', { name: 'Ansehen' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Weitere Aktionen' })).not.toBeInTheDocument();
  });

  it('leaves a non-primary offer with alternatives a plain text button', () => {
    render(
      <MailCard
        spec={cardWith({ label: 'Später', offer: true, alternatives: ALTERNATIVES })}
        messages={MESSAGES}
      />,
    );
    expect(screen.getByRole('button', { name: 'Später' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Weitere Aktionen' })).not.toBeInTheDocument();
  });

  it('splits an action composed in JSX too', async () => {
    const onOffer = vi.fn();
    render(
      <MailCard messages={MESSAGES} onOffer={onOffer}>
        <MailCardFooter>
          <MailCardAction
            action={{ label: 'Starten', offer: true, primary: true, alternatives: ALTERNATIVES }}
          />
        </MailCardFooter>
      </MailCard>,
    );
    await userEvent.click(arrow());
    await userEvent.click(screen.getByRole('menuitem', { name: 'Nur ausstellen' }));
    expect(onOffer).toHaveBeenCalledWith(ALTERNATIVES[2]);
  });

  it('shows no text of its own: the arrow is named by the message it is given', async () => {
    render(
      <MailCard
        spec={WOHNUNGSGEBER_EXAMPLE}
        messages={{ ...MESSAGES, moreActions: 'More actions' }}
      />,
    );
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  });

  it('keeps the arrow and the pill one 36 px high shape', () => {
    render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    const main = screen.getByRole('button', { name: 'Bestätigung ausstellen' });
    expect(main).toHaveClass('min-h-[36px]', 'text-[14px]/[20px]', 'font-medium');
    expect(main).toHaveClass('hover:bg-[var(--mail-card-accent-hover)]');
    expect(arrow()).toHaveClass('hover:bg-[var(--mail-card-accent-hover)]');
    expect(arrow()).toHaveClass('active:bg-[var(--mail-card-accent-active)]');
    expect(arrow().querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('paints the list as a joy Menu does: popup surface and shadow.md, and keeps it from outgrowing the card', async () => {
    const { container } = render(<MailCard spec={WOHNUNGSGEBER_EXAMPLE} messages={MESSAGES} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.style.getPropertyValue('--mail-card-menu-surface')).toBe(
      'var(--color-surface-popup)',
    );
    expect(card.style.getPropertyValue('--mail-card-menu-shadow')).toBe('var(--shadow-md)');
    expect(card.style.getPropertyValue('--mail-card-menu-hover')).toBe(
      'var(--color-neutral-plain-hover-bg)',
    );

    await userEvent.click(arrow());
    expect(screen.getByRole('menu')).toHaveClass(
      'bg-[var(--mail-card-menu-surface)]',
      'w-[320px]',
      'rounded-[12px]',
      'max-h-[320px]',
      'overflow-y-auto',
    );
  });
});

describe('SplitAction', () => {
  it('calls onMain and onAlternative with what each part stands for', async () => {
    const onMain = vi.fn();
    const onAlternative = vi.fn();
    render(
      <SplitAction
        action={{ label: 'Starten', alternatives: ALTERNATIVES }}
        onMain={onMain}
        onAlternative={onAlternative}
        moreActionsLabel="Mehr"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Starten' }));
    expect(onMain).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Mehr' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Nur ausstellen' }));
    expect(onAlternative).toHaveBeenCalledWith(ALTERNATIVES[2]);
    expect(onMain).toHaveBeenCalledTimes(1);
  });
});
