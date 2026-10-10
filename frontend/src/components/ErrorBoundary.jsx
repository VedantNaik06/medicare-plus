import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';
import i18n from '../i18n/index.js';

// If any page crashes while rendering, show a friendly message instead of a blank white screen.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const t = i18n.t.bind(i18n);
    return (
      <div role="alert" className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div className="solid-card flex max-w-md flex-col items-center gap-4 p-8">
          <span className="grid size-14 place-items-center rounded-full bg-amber-100 text-amber-800"><TriangleAlert className="size-7" aria-hidden="true" /></span>
          <h1 className="text-xl font-extrabold">{t('boundary.title')}</h1>
          <p className="text-slate-700">{t('boundary.text')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>{t('boundary.reload')}</button>
            <button type="button" className="btn btn-secondary" onClick={() => window.location.assign('/')}>{t('boundary.home')}</button>
          </div>
        </div>
      </div>
    );
  }
}
