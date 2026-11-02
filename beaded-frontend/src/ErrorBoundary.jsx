import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page empty" role="alert" style={{ minHeight: '100svh', fontFamily: 'var(--face)', color: 'var(--ink)', background: 'var(--ground)' }}>
          <h1 className="t-title">Something went wrong</h1>
          <p>Please refresh the page.</p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>Refresh</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
