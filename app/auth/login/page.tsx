import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import without SSR to prevent chunk loading issues
const LoginClient = dynamic(() => import("./client"), {
  ssr: false,
  loading: () => (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div>Loading...</div>
    </div>
  ),
});

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div>Loading...</div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}