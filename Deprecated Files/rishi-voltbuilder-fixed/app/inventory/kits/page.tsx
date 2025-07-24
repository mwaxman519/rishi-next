/**
 * Kit Templates Page - Redirect to proper templates route
 */

import { redirect } from 'next/navigation';

export default function KitsPage() {
  redirect('/inventory/templates');
}