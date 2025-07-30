&quot;use client&quot;;

import { useEffect } from &quot;react&quot;;

export default function IframeCompatibility({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Check if running in iframe and Replit environment
    const inIframe = typeof window !== 'undefined' && window.self !== window.top;
    const isReplit = typeof window !== 'undefined' && (
      window.location.hostname.includes(&quot;replit&quot;) ||
      window.location.hostname.includes(&quot;repl.it&quot;) ||
      (document.referrer && document.referrer.includes(&quot;replit&quot;))
    );

    // Add iframe-specific styles for Replit
    if (inIframe && isReplit) {
      if (document.body) {
        document.body.style.margin = &quot;0&quot;;
        document.body.style.padding = &quot;0&quot;;
        document.body.style.overflow = &quot;auto&quot;;
      }

      // Ensure the app fills the iframe
      const html = document.documentElement;
      if (html) {
        html.style.height = &quot;100%&quot;;
        html.style.margin = &quot;0&quot;;
        html.style.padding = &quot;0&quot;;
      }

      console.log(&quot;Replit iframe compatibility enabled&quot;);
    }
  }, []);

  return (
    <div className=&quot;min-h-screen&quot;>
      {children}
    </div>
  );
}
