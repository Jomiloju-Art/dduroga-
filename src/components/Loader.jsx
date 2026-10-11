/**
 * DDUROGA loading indicator.
 *
 * The shield draws itself in brand orange over a faint navy shield. The mark and
 * motion are deliberately the same as the pre-mount boot loader in index.html,
 * but the two are separate on purpose:
 *
 *   - the boot loader is plain HTML/CSS, because it has to paint before the JS
 *     bundle has arrived — a React component cannot render at that point, which
 *     is the entire reason it exists;
 *   - this is the React-side equivalent, for loading that happens *after* the
 *     app is running (route chunks, async data).
 *
 * `size`  sm | md | lg
 * `inline` drops to a small spinner-ish mark for use inside a button.
 */
export default function Loader({ label = 'Loading', size = 'md', inline = false, className = '' }) {
  const cls = [
    'ddu-loader',
    `ddu-loader--${size}`,
    inline ? 'ddu-loader--inline' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} role="status" aria-live="polite">
      <svg className="ddu-loader__mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path className="ddu-loader__shield" d="M12 3 20 6v6c0 4.6-3.2 7.9-8 9-4.8-1.1-8-4.4-8-9V6z" />
        <path
          className="ddu-loader__draw"
          pathLength="100"
          d="M12 3 20 6v6c0 4.6-3.2 7.9-8 9-4.8-1.1-8-4.4-8-9V6z"
        />
      </svg>
      <span className="ddu-loader__label">{label}</span>
    </div>
  );
}
