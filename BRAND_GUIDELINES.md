# DharmaDoors Brand Guidelines

> Opening doors to the dharma - Digital tools for the Buddhist community

---

## Brand Essence

DharmaDoors embodies **accessibility, warmth, and timeless wisdom**. The visual identity draws from traditional Buddhist aesthetics while remaining modern and approachable. Every design choice should feel:

- **Grounded** - Earthy, stable, trustworthy
- **Peaceful** - Calm, unhurried, spacious
- **Inviting** - Warm, welcoming, accessible
- **Timeless** - Neither trendy nor dated

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Cream** (Background) | `#F5F3EF` | Page backgrounds, cards, light surfaces |
| **Dharma Tan** | `#A09078` | Logo, headings, primary brand element |
| **Dharma Tan Light** | `#B8A896` | Borders, subtle accents |
| **Dharma Tan Dark** | `#87755F` | Text on light backgrounds, hover states |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Saffron Orange** | `#E97116` | CTAs, active states, Theravada tradition |
| **Wisdom Blue** | `#168EE9` | Links, secondary actions, Mahayana/Zen |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Deep Earth** | `#3D3629` | Body text, dark mode backgrounds |
| **Warm Gray** | `#6B6358` | Secondary text |
| **Mist** | `#E8E5E0` | Dividers, subtle backgrounds |

### Dark Mode

| Light Mode | Dark Mode Equivalent |
|------------|---------------------|
| `#F5F3EF` (Cream) | `#1A1714` (Deep Night) |
| `#A09078` (Dharma Tan) | `#C4B8A8` (Dharma Tan Light) |
| `#3D3629` (Deep Earth) | `#F5F3EF` (Cream) |

---

## Typography

### Recommended Fonts

**Display/Headlines:**
- Primary: **Cormorant Garamond** (elegant, traditional feel)
- Alternative: **Playfair Display** (refined, editorial)

**Body Text:**
- Primary: **Source Sans 3** (readable, warm)
- Alternative: **Lora** (gentle serif option)

### Type Scale

```
Hero:        48-64px / font-weight: 600
H1:          36-48px / font-weight: 600
H2:          28-32px / font-weight: 600
H3:          22-24px / font-weight: 500
Body Large:  18-20px / font-weight: 400
Body:        16px    / font-weight: 400
Caption:     14px    / font-weight: 400
Small:       12px    / font-weight: 400
```

---

## Logo Usage

### The Icon

The DharmaDoors icon features a meditating Buddha silhouette within a pointed arch (representing a doorway). This symbolizes:

- **The arch**: An open door, accessibility, entry point
- **Buddha figure**: Wisdom, peace, the destination
- **Together**: The path to awakening is open to all

### Clear Space

Maintain padding equal to the height of the arch point around the logo.

### Backgrounds

- ✅ Use on cream/off-white backgrounds
- ✅ Use Dharma Tan version on white backgrounds
- ✅ Use light/cream version on dark backgrounds
- ❌ Never place on busy backgrounds without sufficient contrast

---

## UI Components

### Buttons

**Primary Button**
```css
background: #E97116;
color: #FFFFFF;
border-radius: 8px;
padding: 12px 24px;
font-weight: 500;
/* Hover: darken to #D16614 */
```

**Secondary Button**
```css
background: transparent;
border: 2px solid #A09078;
color: #A09078;
border-radius: 8px;
/* Hover: fill with #A09078, text white */
```

**Ghost/Link Button**
```css
color: #168EE9;
text-decoration: underline;
/* Hover: darken to #1279C7 */
```

### Cards

```css
background: #FFFFFF;
border: 1px solid #E8E5E0;
border-radius: 16px;
box-shadow: 0 2px 8px rgba(61, 54, 41, 0.06);
/* Hover: shadow increases, subtle lift */
```

### Form Inputs

```css
background: #FFFFFF;
border: 1px solid #B8A896;
border-radius: 8px;
padding: 12px 16px;
/* Focus: border-color #A09078, ring #A0907840 */
```

---

## Tradition Color Mapping

For SanghaMap and other multi-tradition features:

| Tradition | Color | Hex |
|-----------|-------|-----|
| Theravada | Saffron Orange | `#E97116` |
| Mahayana | Wisdom Blue | `#168EE9` |
| Vajrayana | Lotus Red | `#DC4545` |
| Zen | Bamboo Green | `#22A55E` |
| Pure Land | Sky Blue | `#3B82F6` |
| Nichiren | Royal Purple | `#8B5CF6` |
| Secular | Neutral Gray | `#6B7280` |
| Multi-Tradition | Harmony Pink | `#EC4899` |

---

## Photography & Imagery

### Style Guidelines

- **Authentic**: Real temples, real practitioners, real moments
- **Warm lighting**: Golden hour, soft natural light preferred
- **Space**: Generous negative space, not cluttered
- **Diverse**: Represent all Buddhist traditions and practitioners

### Treatment

- Slight warm color grade (subtle sepia shift)
- Soft contrast, not overly processed
- Optional subtle grain for texture

---

## Voice & Tone

### Principles

1. **Accessible**: No jargon without explanation
2. **Respectful**: Honor all traditions equally
3. **Warm**: Friendly but not casual
4. **Helpful**: Service-oriented, practical
5. **Non-sectarian**: Inclusive of all Buddhist paths

### Examples

✅ "Find Buddhist communities near you"
❌ "Locate sanghas in your vicinity"

✅ "Free for everyone, supported by generosity"
❌ "Freemium model with donation options"

---

## CSS Variables Reference

```css
:root {
  /* Primary */
  --color-cream: #F5F3EF;
  --color-dharma-tan: #A09078;
  --color-dharma-tan-light: #B8A896;
  --color-dharma-tan-dark: #87755F;

  /* Secondary */
  --color-saffron: #E97116;
  --color-wisdom-blue: #168EE9;

  /* Neutrals */
  --color-deep-earth: #3D3629;
  --color-warm-gray: #6B6358;
  --color-mist: #E8E5E0;

  /* Background */
  --background: #F5F3EF;
  --foreground: #3D3629;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-cream: #1A1714;
    --color-dharma-tan: #C4B8A8;
    --background: #1A1714;
    --foreground: #F5F3EF;
  }
}
```

---

## Tailwind Configuration

```javascript
// tailwind.config.js extension
colors: {
  cream: '#F5F3EF',
  'dharma-tan': {
    light: '#B8A896',
    DEFAULT: '#A09078',
    dark: '#87755F',
  },
  saffron: '#E97116',
  'wisdom-blue': '#168EE9',
  'deep-earth': '#3D3629',
  'warm-gray': '#6B6358',
  mist: '#E8E5E0',
}
```

---

## Resources

### Frontend Design References

- [Anthropic Frontend Design Skill](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design) - Guidelines for distinctive UI
- [21st.dev Magic MCP](https://21st.dev/magic/console) - AI-powered component generation

### Implementation Notes

**Avoiding "AI Slop"** (per Anthropic guidelines):
- ❌ Generic purple gradients on white
- ❌ Overused fonts (Inter, Roboto)
- ❌ Cookie-cutter layouts
- ✅ Distinctive font pairings (Cormorant + Source Sans)
- ✅ Earthy, warm color palette
- ✅ Purposeful use of space and asymmetry

---

*Last updated: January 2026*
