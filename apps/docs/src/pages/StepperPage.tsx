import { Step, StepButton, StepIndicator, Stepper, Typography } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function StepperPage() {
  return (
    <>
      <h1>Stepper</h1>
      <p className="docs-lede">
        Progress through an ordered sequence. <code>Stepper</code> renders an{' '}
        <code>&lt;ol&gt;</code>, each <code>Step</code> an <code>&lt;li&gt;</code> with the
        connector line, <code>StepIndicator</code> the numbered or checked bubble, and{' '}
        <code>StepButton</code> makes a step clickable.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <Stepper>
          <Step completed>
            <StepIndicator variant="solid" color="primary">
              ✓
            </StepIndicator>
            Account
          </Step>
          <Step active>
            <StepIndicator variant="solid" color="primary">
              2
            </StepIndicator>
            Address
          </Step>
          <Step>
            <StepIndicator>3</StepIndicator>
            Payment
          </Step>
        </Stepper>
      </Demo>
      <Code>{`<Stepper>
  <Step completed>
    <StepIndicator variant="solid" color="primary">✓</StepIndicator>
    Account
  </Step>
  <Step active>
    <StepIndicator variant="solid" color="primary">2</StepIndicator>
    Address
  </Step>
  <Step>
    <StepIndicator>3</StepIndicator>
    Payment
  </Step>
</Stepper>`}</Code>

      <h2>Step states</h2>
      <p>
        <code>active</code>, <code>completed</code> and <code>disabled</code> are independent flags
        you set yourself — Stepper does not derive them from an index.
      </p>
      <Demo>
        <Stepper>
          <Step completed>
            <StepIndicator variant="solid" color="success">
              ✓
            </StepIndicator>
            Completed
          </Step>
          <Step active>
            <StepIndicator variant="solid" color="primary">
              2
            </StepIndicator>
            Active
          </Step>
          <Step>
            <StepIndicator>3</StepIndicator>
            Upcoming
          </Step>
          <Step disabled>
            <StepIndicator>4</StepIndicator>
            Disabled
          </Step>
        </Stepper>
      </Demo>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Stepper key={size} size={size}>
              <Step completed>
                <StepIndicator variant="solid" color="primary">
                  ✓
                </StepIndicator>
                One
              </Step>
              <Step active>
                <StepIndicator variant="solid" color="primary">
                  2
                </StepIndicator>
                Two
              </Step>
              <Step>
                <StepIndicator>3</StepIndicator>
                Three
              </Step>
            </Stepper>
          ))}
        </div>
      </Demo>

      <h2>Vertical orientation</h2>
      <p>
        Set <code>orientation</code> on the <code>Stepper</code> and on each <code>Step</code> —
        the step draws its own connector, so it needs to know which way the line runs.
      </p>
      <Demo>
        <Stepper orientation="vertical">
          <Step orientation="vertical" completed>
            <StepIndicator variant="solid" color="primary">
              ✓
            </StepIndicator>
            <div>
              <Typography level="title-sm">Order placed</Typography>
              <Typography level="body-sm">Confirmed on 2 September</Typography>
            </div>
          </Step>
          <Step orientation="vertical" active>
            <StepIndicator variant="solid" color="primary">
              2
            </StepIndicator>
            <div>
              <Typography level="title-sm">In transit</Typography>
              <Typography level="body-sm">Expected in two days</Typography>
            </div>
          </Step>
          <Step orientation="vertical">
            <StepIndicator>3</StepIndicator>
            <div>
              <Typography level="title-sm">Delivered</Typography>
            </div>
          </Step>
        </Stepper>
      </Demo>
      <Code>{`<Stepper orientation="vertical">
  <Step orientation="vertical" active>
    <StepIndicator variant="solid" color="primary">2</StepIndicator>
    In transit
  </Step>
</Stepper>`}</Code>

      <h2>Clickable steps</h2>
      <p>
        <code>StepButton</code> stretches over the step&apos;s content and turns it into a real{' '}
        <code>&lt;button&gt;</code>, so keyboard users can jump between steps.
      </p>
      <Demo>
        <Stepper>
          <Step completed>
            <StepIndicator variant="solid" color="primary">
              ✓
            </StepIndicator>
            <StepButton>Account</StepButton>
          </Step>
          <Step active>
            <StepIndicator variant="solid" color="primary">
              2
            </StepIndicator>
            <StepButton>Address</StepButton>
          </Step>
          <Step>
            <StepIndicator>3</StepIndicator>
            <StepButton>Payment</StepButton>
          </Step>
        </Stepper>
      </Demo>
      <Code>{`<Step active>
  <StepIndicator variant="solid" color="primary">2</StepIndicator>
  <StepButton onClick={() => goTo(2)}>Address</StepButton>
</Step>`}</Code>

      <h2>StepIndicator variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <StepIndicator variant={variant} color={color}>
              1
            </StepIndicator>
          )}
        />
      </Demo>
      <Code>{`<StepIndicator variant="soft" color="success">✓</StepIndicator>`}</Code>

      <h2>Stepper props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The Step elements.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Indicator size, gaps and font size.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction the sequence runs in.' },
        ]}
      />

      <h2>Step props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'A StepIndicator plus the step label or content.' },
          { name: 'active', type: 'boolean', default: 'false', description: 'Marks this step as the current one.' },
          { name: 'completed', type: 'boolean', default: 'false', description: 'Marks this step as done and fills its connector.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction of this step’s connector. Match it to the Stepper.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the step and blocks interaction.' },
        ]}
      />

      <h2>StepIndicator props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The bubble content — a number, a check, an icon.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'soft'", description: 'Visual style of the bubble.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
        ]}
      />

      <h2>StepButton props</h2>
      <p>
        <code>StepButton</code> takes no props of its own beyond the standard{' '}
        <code>&lt;button&gt;</code> attributes. Its <code>type</code> defaults to{' '}
        <code>&quot;button&quot;</code> so it never submits a surrounding form by accident.
      </p>
    </>
  );
}
