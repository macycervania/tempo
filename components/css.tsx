'use client';

import React, { useState } from 'react';

// The design prototype expressed every style as a CSS declaration STRING
// (e.g. "display:flex;gap:8px"). Porting those verbatim keeps the result
// pixel-identical, so this helper parses such a string into a React style object.

function toCamel(prop: string): string {
  const p = prop.trim();
  if (p.startsWith('--')) return p; // CSS custom property — valid React style key
  let camel = p.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
  // React expects lowercase `ms` vendor prefix (e.g. msTransform).
  if (camel.startsWith('Ms')) camel = 'm' + camel.slice(1);
  return camel;
}

/** Parse an inline CSS string into a React.CSSProperties object. */
export function css(style?: string): React.CSSProperties {
  const out: Record<string, string> = {};
  if (!style) return out as React.CSSProperties;
  for (const decl of style.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop) continue;
    out[toCamel(prop)] = val;
  }
  return out as React.CSSProperties;
}

type HovProps = {
  /** Element tag to render. */
  as?: keyof JSX.IntrinsicElements;
  /** Base style string (prototype format). */
  styleStr?: string;
  /** Style string merged in while hovered (the `style-hover` of the prototype). */
  hover?: string;
  /** Extra React style object merged last (used for data-URL backgrounds etc). */
  styleObj?: React.CSSProperties;
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, 'style'> &
  Record<string, unknown>;

/**
 * Renders an element whose inline style is a prototype CSS string, optionally
 * applying a second CSS string on hover — the faithful equivalent of the
 * design tool's `style` + `style-hover` pair.
 */
export function Hov({
  as = 'div',
  styleStr,
  hover,
  styleObj,
  children,
  ...rest
}: HovProps) {
  const [h, setH] = useState(false);
  const merged = css(h && hover ? `${styleStr || ''};${hover}` : styleStr);
  const finalStyle = styleObj ? { ...merged, ...styleObj } : merged;
  const handlers = hover
    ? {
        onMouseEnter: () => setH(true),
        onMouseLeave: () => setH(false),
      }
    : {};
  return React.createElement(
    as,
    { ...rest, ...handlers, style: finalStyle },
    children,
  );
}
