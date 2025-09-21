import React from "react";
import Container from "./Container";
import classNames from "classnames";

export type SectionVariant = "base" | "alt" | "muted" | "inverse";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
  noPadding?: boolean;
  containerClassName?: string;
  as?: React.ElementType;
}

/**
 * Section wrapper: konsistensi spacing vertical, background tiers, dan container.
 * Variant mapping -> kelas surface:
 * base -> section-base, alt -> section-alt, muted -> section-muted, inverse -> section-inverse
 */
export function Section({
  children,
  className,
  containerClassName,
  variant = "base",
  noPadding = false,
  as: Tag = "section",
  ...rest
}: SectionProps) {
  return (
    <Tag
      className={classNames(
        `relative w-full transition-colors ${
          variant === "base"
            ? "section-base"
            : variant === "alt"
            ? "section-alt"
            : variant === "muted"
            ? "section-muted"
            : "section-inverse"
        }`,
        !noPadding && "py-20 md:py-28",
        className
      )}
      {...rest}
    >
      <Container className={containerClassName}>{children}</Container>
    </Tag>
  );
}

export default Section;
