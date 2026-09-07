import {
  AspectRatio,
  Button,
  Card,
  CardActions,
  CardContent,
  CardCover,
  CardOverflow,
  Sheet,
  Typography,
} from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function CardPage() {
  return (
    <>
      <h1>Card</h1>
      <p className="docs-lede">
        A Sheet composition with its own border radius, padding and a vertical flex layout for its
        children.
      </p>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Card variant={variant} color={color}>
              {color}
            </Card>
          )}
        />
      </Demo>
      <Code>{`<Card variant="outlined" color="neutral">
  <Typography level="title-md">Title</Typography>
  <Typography level="body-sm">Description text.</Typography>
</Card>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the card.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'component', type: 'React.ElementType', default: "'div'", description: 'Renders as a different element/component.' },
        ]}
      />

      <h2>Structural parts</h2>
      <p>
        A Card is a plain container — the parts below give it structure.{' '}
        <code>CardContent</code> is the text block, <code>CardActions</code> the button row,{' '}
        <code>CardOverflow</code> breaks content out of the card&apos;s padding, and{' '}
        <code>CardCover</code> puts a full-bleed layer behind everything.
      </p>
      <Demo>
        <Card style={{ maxWidth: 280 }}>
          <CardOverflow>
            <AspectRatio ratio="16 / 9">
              <Sheet variant="soft" color="primary" style={{ height: '100%' }} />
            </AspectRatio>
          </CardOverflow>
          <CardContent>
            <Typography level="title-md">Freiburg</Typography>
            <Typography level="body-sm">
              The image bleeds to the edges because CardOverflow cancels the card padding.
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="plain" color="neutral">
              Share
            </Button>
            <Button variant="solid" color="primary">
              Book
            </Button>
          </CardActions>
        </Card>
      </Demo>
      <Code>{`<Card>
  <CardOverflow>
    <AspectRatio ratio="16 / 9"><img src={photo} alt="" /></AspectRatio>
  </CardOverflow>
  <CardContent>
    <Typography level="title-md">Freiburg</Typography>
  </CardContent>
  <CardActions>
    <Button variant="solid" color="primary">Book</Button>
  </CardActions>
</Card>`}</Code>

      <h2>CardCover</h2>
      <p>
        <code>CardCover</code> sits behind the card&apos;s own content, so text stays readable on
        top of an image or a gradient.
      </p>
      <Demo>
        <Card style={{ maxWidth: 280, minHeight: 160 }}>
          <CardCover>
            <div
              style={{
                background: 'linear-gradient(160deg, #0b6bcb, #a5d8ff)',
                width: '100%',
                height: '100%',
              }}
            />
          </CardCover>
          <CardContent>
            <Typography level="title-md" style={{ color: 'white' }}>
              On top of the cover
            </Typography>
          </CardContent>
        </Card>
      </Demo>
      <Code>{`<Card>
  <CardCover>
    <img src={photo} alt="" />
  </CardCover>
  <CardContent>
    <Typography level="title-md">On top of the cover</Typography>
  </CardContent>
</Card>`}</Code>

      <h2>Orientation of the parts</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 340 }}>
          <Card>
            <CardContent orientation="horizontal">
              <Typography level="title-sm">Storage</Typography>
              <Typography level="body-sm">84% used</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardActions orientation="horizontal-reverse">
              <Button variant="solid" color="primary">
                Primary first in the DOM
              </Button>
              <Button variant="plain" color="neutral">
                Cancel
              </Button>
            </CardActions>
          </Card>
        </div>
      </Demo>
      <Code>{`<CardContent orientation="horizontal">…</CardContent>
<CardActions orientation="horizontal-reverse">…</CardActions>`}</Code>

      <h2>CardContent props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The card body content.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'vertical'", description: 'Direction the content is laid out in.' },
        ]}
      />

      <h2>CardActions props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The action buttons.' },
          { name: 'orientation', type: "'horizontal' | 'horizontal-reverse' | 'vertical'", default: "'horizontal'", description: 'Direction the actions run in. The reverse variant flips visual order without changing the DOM order.' },
        ]}
      />

      <h2>CardOverflow and CardCover</h2>
      <p>
        Neither takes props beyond the standard <code>&lt;div&gt;</code> attributes.{' '}
        <code>CardOverflow</code> cancels a fixed 16px of card padding, matching this build&apos;s
        Card; Joy UI reads the card&apos;s actual padding at runtime through a CSS variable
        instead.
      </p>
    </>
  );
}
