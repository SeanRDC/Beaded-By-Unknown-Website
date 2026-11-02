import { Sheet } from '../components/Sheet.jsx';

/* A labelled control. Pass `as` for a select or textarea. */
export function Field({ label, as = 'input', className = '', children, ...rest }) {
  const Control = as;
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <Control className="input" {...rest}>{children}</Control>
    </label>
  );
}

export function PageHead({ title, note, children }) {
  return (
    <header className="page-head">
      <div>
        <h1 className="t-title">{title}</h1>
        {note && <p className="soft studio-note">{note}</p>}
      </div>
      {children}
    </header>
  );
}

export function Empty({ children }) {
  return <p className="soft studio-empty">{children}</p>;
}

export function State({ value }) {
  return <span className="studio-state" data-state={value}>{value}</span>;
}

/* Asks before anything permanent happens. */
export function Confirm({ request, onClose }) {
  const accept = () => {
    request.onYes();
    onClose();
  };

  return (
    <Sheet open={Boolean(request)} onClose={onClose} label={request?.title} closeButton={false}>
      {request && (
        <div className="notice">
          <h2>{request.title}</h2>
          <p className="soft">{request.message}</p>
          <div className="studio-actions">
            <button type="button" className="btn btn--quiet" data-autofocus onClick={onClose}>Keep it</button>
            <button type="button" className="btn btn--danger" onClick={accept}>{request.action}</button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
