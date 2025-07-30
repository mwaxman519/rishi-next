import React from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { Clock } from &quot;lucide-react&quot;;

export default function FixedAvailabilityLink() {
  // Create a floating link that&apos;s always visible
  return (
    <div className=&quot;fixed-availability-link&quot;>
      <Link
        href=&quot;/availability&quot;
        className=&quot;availability-btn&quot;
        title=&quot;My Availability&quot;
      >
        <Clock className=&quot;icon&quot; size={20} />
        <span className=&quot;label&quot;>My Availability</span>
      </Link>

      <style jsx>{`
        .fixed-availability-link {
          position: fixed;
          left: 20px;
          bottom: 20px;
          z-index: 9999;
        }

        .availability-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background-color: #0070f3;
          color: white;
          border-radius: 50px;
          box-shadow: 0 4px 14px rgba(0, 118, 244, 0.39);
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .availability-btn:hover {
          background-color: #0061d5;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 118, 244, 0.23);
        }

        .icon {
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .label {
            display: none;
          }

          .availability-btn {
            padding: 12px;
            border-radius: 50%;
          }
        }
      `}</style>
    </div>
  );
}
