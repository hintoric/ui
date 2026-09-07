import { useState } from 'react';
import { Button, ConfirmationDialog } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const CUSTOMER = 'kunde-4711';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ConfirmationDialogPage() {
  const [basic, setBasic] = useState(false);
  const [slow, setSlow] = useState(false);
  const [failing, setFailing] = useState(false);
  const [color, setColor] = useState<'warning' | null>(null);
  const [size, setSize] = useState<'sm' | 'lg' | null>(null);
  const [deleted, setDeleted] = useState(false);

  return (
    <>
      <h1>ConfirmationDialog</h1>
      <p className="docs-lede">
        A dialog for an irreversible act, where the confirmation is typed rather than clicked.
      </p>

      <h2>Basic usage</h2>
      <p>
        The confirm button stays locked until the field holds <code>{CUSTOMER}</code> exactly. That
        friction is the point: it makes you read <em>what</em> is about to be deleted, not just
        that something is.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Button variant="outlined" color="danger" onClick={() => setBasic(true)}>
            Delete customer
          </Button>
          {deleted && <span>Deleted.</span>}
        </div>
        <ConfirmationDialog
          open={basic}
          onClose={() => setBasic(false)}
          onConfirm={() => setDeleted(true)}
          confirmationText={CUSTOMER}
          title="Delete customer"
          description="Every record belonging to this customer goes with it. This cannot be undone."
          prompt={(name) => (
            <>
              Type <b>{name}</b> to confirm.
            </>
          )}
          errorMessage={() => 'Deleting failed.'}
          confirmLabel="Delete permanently"
          cancelLabel="Cancel"
        />
      </Demo>
      <Code>{`const [open, setOpen] = useState(false);

<ConfirmationDialog
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={() => deleteCustomer(customer.id)}
  confirmationText={customer.name}
  title="Delete customer"
  description="Every record belonging to this customer goes with it. This cannot be undone."
  prompt={(name) => <>Type <b>{name}</b> to confirm.</>}
  errorMessage={(error) => (error instanceof ApiError ? error.detail : 'Deleting failed.')}
  confirmLabel="Delete permanently"
  cancelLabel="Cancel"
/>`}</Code>

      <h2>Every string is yours</h2>
      <p>
        There are no built-in English defaults for the title, the description, the prompt or the
        buttons. Like <code>LocaleSwitcher</code>, this block does not decide what language its
        consumers speak — and a default nobody noticed would ship English text into a German
        application, a mistake that only surfaces in production.
      </p>
      <p>
        <code>prompt</code> is a function rather than a node so it receives the very string that is
        compared. Passing the name twice invites the one bug that cannot be typed away: showing
        &ldquo;Kunde-4711&rdquo; while comparing against &ldquo;kunde-4711&rdquo; produces a dialog
        that can never be confirmed.
      </p>

      <h2>What has to be typed</h2>
      <p>
        Both sides are trimmed, then compared exactly, <strong>case included</strong>. Trimmed
        because pasting regularly carries a trailing space or newline, and a dialog stuck on an
        invisible character is broken rather than strict. Case-sensitive because looking closely is
        the whole purpose. There is no switch to relax it — it would only serve to disable the
        component&rsquo;s reason for existing.
      </p>
      <p>
        A blank <code>confirmationText</code> keeps the button locked: otherwise the untouched,
        empty field would read as &ldquo;equal&rdquo; and confirm a deletion nobody typed for.
      </p>

      <h2>While the deletion runs</h2>
      <p>
        <code>onConfirm</code> may return a promise. The block awaits it, puts the confirm button
        into its loading state and locks the field, the cancel button and — deliberately — Escape
        and the backdrop too. A dispatched deletion cannot be recalled, so closing the dialog
        mid-flight would leave you never learning the outcome.
      </p>
      <Demo>
        <Button variant="outlined" color="danger" onClick={() => setSlow(true)}>
          Delete slowly (2s)
        </Button>
        <ConfirmationDialog
          open={slow}
          onClose={() => setSlow(false)}
          onConfirm={() => wait(2000)}
          confirmationText={CUSTOMER}
          title="Delete customer"
          description="Takes two seconds on purpose — try Escape while it runs."
          prompt={(name) => (
            <>
              Type <b>{name}</b> to confirm.
            </>
          )}
          errorMessage={() => 'Deleting failed.'}
          confirmLabel="Delete permanently"
          cancelLabel="Cancel"
        />
      </Demo>

      <h2>When it fails</h2>
      <p>
        A rejection is handed to <code>errorMessage</code>, which turns it into text for an alert
        inside the dialog. The typed text stays, so a second attempt is one click. The rejection
        reaches you unchanged — a rejection is not always an <code>Error</code> with a readable
        message, and this library has no wording of its own to fall back on.
      </p>
      <Demo>
        <Button variant="outlined" color="danger" onClick={() => setFailing(true)}>
          Delete, but fail
        </Button>
        <ConfirmationDialog
          open={failing}
          onClose={() => setFailing(false)}
          onConfirm={async () => {
            await wait(600);
            throw new Error('Customer still has open orders.');
          }}
          confirmationText={CUSTOMER}
          title="Delete customer"
          prompt={(name) => (
            <>
              Type <b>{name}</b> to confirm.
            </>
          )}
          errorMessage={(error) => (error instanceof Error ? error.message : 'Deleting failed.')}
          confirmLabel="Delete permanently"
          cancelLabel="Cancel"
        />
      </Demo>

      <h2>Color</h2>
      <p>
        <code>color</code> defaults to <code>danger</code> and reaches the confirm button and the
        error alert — nothing else. The surface stays neutral and the field stays neutral too:
        tinting the input red while someone is halfway through typing punishes the typing itself,
        and the locked button already says &ldquo;not equal yet&rdquo;. Cancel is plain and neutral
        so the dangerous act is the only coloured surface in the dialog.
      </p>
      <Demo>
        <Button variant="outlined" color="warning" onClick={() => setColor('warning')}>
          Archive project
        </Button>
        <ConfirmationDialog
          open={color === 'warning'}
          onClose={() => setColor(null)}
          onConfirm={() => {}}
          color="warning"
          confirmationText="projekt-alpha"
          title="Archive project"
          description="Archiving hides the project for everyone. An admin can restore it."
          prompt={(name) => (
            <>
              Type <b>{name}</b> to confirm.
            </>
          )}
          errorMessage={() => 'Archiving failed.'}
          confirmLabel="Archive"
          cancelLabel="Cancel"
        />
      </Demo>

      <h2>Sizes</h2>
      <p>
        <code>size</code> passes through to the surface, the field and both buttons.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Button variant="outlined" size="sm" onClick={() => setSize('sm')}>
            size=&quot;sm&quot;
          </Button>
          <Button variant="outlined" size="lg" onClick={() => setSize('lg')}>
            size=&quot;lg&quot;
          </Button>
        </div>
        <ConfirmationDialog
          open={size !== null}
          onClose={() => setSize(null)}
          onConfirm={() => {}}
          size={size ?? 'md'}
          confirmationText={CUSTOMER}
          title="Delete customer"
          description={`Rendered at size="${size ?? 'md'}".`}
          prompt={(name) => (
            <>
              Type <b>{name}</b> to confirm.
            </>
          )}
          errorMessage={() => 'Deleting failed.'}
          confirmLabel="Delete permanently"
          cancelLabel="Cancel"
        />
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'open', type: 'boolean', description: 'Controlled, like Modal and Drawer.' },
          {
            name: 'onClose',
            type: '() => void',
            description:
              'Cancel, Escape and the backdrop call it — except while a deletion is in flight. The block also calls it itself once onConfirm has succeeded.',
          },
          {
            name: 'onConfirm',
            type: '() => void | Promise<void>',
            description:
              'May be async. The block awaits it, shows the loading state and blocks a second submit.',
          },
          {
            name: 'confirmationText',
            type: 'string',
            description:
              'What has to be typed. Trimmed on both sides, compared exactly and case-sensitively. Blank keeps the button locked.',
          },
          { name: 'title', type: 'React.ReactNode', description: "The dialog's accessible name." },
          {
            name: 'description',
            type: 'React.ReactNode',
            description: "Optional. Becomes the dialog's accessible description.",
          },
          {
            name: 'prompt',
            type: '(confirmationText: string) => React.ReactNode',
            description:
              'The sentence above the field. Receives the compared string, so what is shown cannot drift from what is checked.',
          },
          {
            name: 'errorMessage',
            type: '(error: unknown) => React.ReactNode',
            description:
              'Turns a rejection from onConfirm into text for the alert. Required: a rejection need not be an Error, and there is no built-in wording.',
          },
          { name: 'confirmLabel', type: 'React.ReactNode', description: 'The dangerous button.' },
          { name: 'cancelLabel', type: 'React.ReactNode', description: 'The way out.' },
          {
            name: 'color',
            type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'",
            default: "'danger'",
            description: 'Reaches the confirm button and the error alert only.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Passed through to the surface, the field and both buttons.',
          },
        ]}
      />
    </>
  );
}
