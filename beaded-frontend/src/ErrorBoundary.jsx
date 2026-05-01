import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#FAF6F1', color: '#3E2F1C', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Something went wrong.</h1>
          <p style={{ color: '#8B7D6B', marginBottom: '2rem' }}>We encountered an unexpected error. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '12px 24px', backgroundColor: '#3E2F1C', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;