import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
            {this.props.fallbackMessage || 'Something went wrong.'}
          </p>
          <button onClick={() => this.setState({ hasError: false })} style={{
            marginTop: 12, padding: '8px 14px', borderRadius: 7,
            background: '#fff', color: '#0a0a0a', fontSize: 13, fontWeight: 500,
          }}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
