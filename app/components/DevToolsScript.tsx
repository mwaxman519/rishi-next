&quot;use client&quot;;

import { useEffect } from &quot;react&quot;;

// This component will only be rendered on the client side
export default function DevToolsScript() {
  useEffect(() => {
    // Set up chunk retry mechanism
    window.addEventListener(&quot;error&quot;, function (event) {
      // Only retry on chunk load errors
      if (event && event.message && event.message.includes(&quot;ChunkLoadError&quot;)) {
        console.log(&quot;Detected chunk load error, attempting to recover...&quot;);
        // Reload the page once to try recovering
        if (!sessionStorage.getItem(&quot;chunk_retry&quot;)) {
          sessionStorage.setItem(&quot;chunk_retry&quot;, &quot;1&quot;);
          window.location.reload();
        }
      }
    });

    // This code will only run in the browser, after hydration
    const erudaScript = document.createElement(&quot;script&quot;);
    erudaScript.src = &quot;/__replco/static/devtools/eruda/3.2.3/eruda.js&quot;;
    document.head.appendChild(erudaScript);
  }, []);

  return null;
}
