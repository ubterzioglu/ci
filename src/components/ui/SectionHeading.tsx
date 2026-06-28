import { cn } from '@/lib/utils';

type HeadingLevel = 'h1' | 'h2' | 'h3';
type Align = 'left' | 'center';
type Tone = 'dark' | 'light';

export interface SectionHeadingProps {
  title: string;
  eyebrow?: string;
  align?: Align;
  as?: HeadingLevel;
  /**
   * Surface the heading sits on. `'dark'` (default) renders charcoal text for
   * light backgrounds; `'light'` renders ivory text for dark/photo backgrounds.
   */
  tone?: Tone;
  className?: string;
}

export function SectionHeading({
  title,
  eyebrow,
  align = 'center',
  as: Tag = 'h2',
  tone = 'dark',
  className,
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        isCenter ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <Tag
        className={cn(
          'font-display text-3xl md:text-4xl',
          tone === 'light' ? 'text-ivory' : 'text-charcoal',
        )}
      >
        {title}
      </Tag>
      {isCenter && <div className="rule-olive" aria-hidden="true" />}
    </div>
  );
}

export default SectionHeading;
