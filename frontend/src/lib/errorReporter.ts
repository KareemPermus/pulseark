export function initErrorReporter() {
  if (typeof window === 'undefined') return;

  const reportUrl = process.env.NEXT_PUBLIC_RUNTIME_ERROR_REPORT_URL;
  let appId = process.env.NEXT_PUBLIC_APP_ID || '';
  if (!appId) {
    const match = window.location.hostname.match(/^preview-([^.]+)/);
    if (match) appId = match[1];
  }

  function send(message: string, stack?: string) {
    if (!reportUrl) return;
    fetch(reportUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: appId,
        message,
        stack: stack || '',
        url: window.location.href,
        user_agent: navigator.userAgent,
      }),
    }).catch(() => {});
  }

  window.onerror = (msg, _src, _line, _col, err) => {
    send(String(msg), err?.stack);
  };
  window.onunhandledrejection = (e) => {
    send(e.reason?.message || String(e.reason), e.reason?.stack);
  };
  const origError = console.error;
  console.error = (...args: any[]) => {
    origError.apply(console, args);
    send(args.map(String).join(' '));
  };
}