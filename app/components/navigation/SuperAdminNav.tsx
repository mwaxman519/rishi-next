import { NavItem, NAV_ITEM_TYPES } from &quot;@shared/navigation-constants&quot;;

// Super Admin Navigation - Defined explicitly to guarantee consistency
export const SUPER_ADMIN_NAV: NavItem[] = [
  {
    label: &quot;Dashboard&quot;,
    path: &quot;/dashboard&quot;,
    icon: &quot;LayoutDashboard&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  // &quot;My Availability&quot; has been moved to the Brand Agents section only
  {
    label: &quot;Documentation&quot;,
    path: &quot;/docs&quot;,
    icon: &quot;FileText&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
  },
  {
    label: &quot;Rishi Management&quot;,
    path: &quot;/client-management&quot;,
    icon: &quot;Briefcase&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Dashboard & Overview&quot;,
        path: &quot;/client-management&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Staff Management&quot;,
        path: &quot;/client-management/staff&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Client Management&quot;,
        path: &quot;/client-management/accounts&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Kit Management&quot;,
        path: &quot;/client-management/kits&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Location Management&quot;,
        path: &quot;/client-management/locations&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Bookings Management&quot;,
        path: &quot;/bookings&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;User Management&quot;,
        path: &quot;/client-management/users&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Billing&quot;,
        path: &quot;/client-management/billing&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Client Users&quot;,
    path: &quot;/clients&quot;,
    icon: &quot;Building2&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Dashboard & Overview&quot;,
        path: &quot;/clients&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Staff Visibility&quot;,
        path: &quot;/staff&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Client Profile&quot;,
        path: &quot;/profile&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      { label: &quot;Kit Management&quot;, path: &quot;/kits&quot;, type: NAV_ITEM_TYPES.PRIMARY },
      {
        label: &quot;Event Management&quot;,
        path: &quot;/events&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Location Management&quot;,
        path: &quot;/locations&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      { label: &quot;Resources&quot;, path: &quot;/resources&quot;, type: NAV_ITEM_TYPES.PRIMARY },
    ],
  },
  {
    label: &quot;Brand Agents&quot;,
    path: &quot;/agent-dashboard&quot;,
    icon: &quot;UserCheck&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Personal Dashboard&quot;,
        path: &quot;/agent-dashboard&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;My Availability&quot;,
        path: &quot;/availability&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Profile Management&quot;,
        path: &quot;/profile&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      { label: &quot;Events&quot;, path: &quot;/events&quot;, type: NAV_ITEM_TYPES.PRIMARY },
      { label: &quot;Requests&quot;, path: &quot;/requests&quot;, type: NAV_ITEM_TYPES.PRIMARY },
      {
        label: &quot;Team Calendar&quot;,
        path: &quot;/team-calendar&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      { label: &quot;Resources&quot;, path: &quot;/resources&quot;, type: NAV_ITEM_TYPES.PRIMARY },
    ],
  },
  // Platform Administration Section
  {
    label: &quot;Organizations&quot;,
    path: &quot;/admin/organizations&quot;,
    icon: &quot;Building2&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Organization List&quot;,
        path: &quot;/admin/organizations&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Organization Settings&quot;,
        path: &quot;/admin/organizations/settings&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Cross-Org Analytics&quot;,
        path: &quot;/admin/organizations/analytics&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Users & Access&quot;,
    path: &quot;/admin/users&quot;,
    icon: &quot;Users&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;User Management&quot;,
        path: &quot;/admin/users&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Access Control&quot;,
        path: &quot;/admin/access-control&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;User Analytics&quot;,
        path: &quot;/admin/users/analytics&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Operations&quot;,
    path: &quot;/admin/operations&quot;,
    icon: &quot;Briefcase&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Events Management&quot;,
        path: &quot;/admin/events&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Location Approval&quot;,
        path: &quot;/admin/locations/approval-queue&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Bookings Management&quot;,
        path: &quot;/bookings&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Create Booking&quot;,
        path: &quot;/bookings/new&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Staff Management&quot;,
        path: &quot;/admin/staff&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;System&quot;,
    path: &quot;/admin/system&quot;,
    icon: &quot;Settings&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Platform Settings&quot;,
        path: &quot;/admin/system/settings&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Feature Management&quot;,
        path: &quot;/admin/features&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Database Tools&quot;,
        path: &quot;/admin/system/database&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;API Management&quot;,
        path: &quot;/admin/system/api&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Monitoring&quot;,
    path: &quot;/admin/monitoring&quot;,
    icon: &quot;Activity&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;System Status&quot;,
        path: &quot;/admin/system-status&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Security Monitoring&quot;,
        path: &quot;/admin/security&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Performance Analytics&quot;,
        path: &quot;/admin/monitoring/performance&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Audit Logs&quot;,
        path: &quot;/admin/monitoring/audit&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
  {
    label: &quot;Tools&quot;,
    path: &quot;/admin/tools&quot;,
    icon: &quot;Wrench&quot;,
    type: NAV_ITEM_TYPES.PRIMARY,
    children: [
      {
        label: &quot;Test Data&quot;,
        path: &quot;/admin/test-data&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Debug Console&quot;,
        path: &quot;/admin/tools/debug&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Infrastructure Demo&quot;,
        path: &quot;/infrastructure&quot;,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
    ],
  },
];

export const SUPER_ADMIN_SECONDARY_NAV: NavItem[] = [
  {
    label: &quot;User Menu&quot;,
    path: &quot;#&quot;,
    type: NAV_ITEM_TYPES.SECONDARY,
    children: [
      { label: &quot;Profile&quot;, path: &quot;/profile&quot;, type: NAV_ITEM_TYPES.SECONDARY },
      {
        label: &quot;Preferences&quot;,
        path: &quot;/profile/preferences&quot;,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      { label: &quot;Help&quot;, path: &quot;/help&quot;, type: NAV_ITEM_TYPES.SECONDARY },
      {
        label: &quot;Logout&quot;,
        path: &quot;/api/auth/logout&quot;,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
    ],
  },
  {
    label: &quot;Quick Actions&quot;,
    path: &quot;#&quot;,
    type: NAV_ITEM_TYPES.SECONDARY,
    children: [
      {
        label: &quot;Notifications&quot;,
        path: &quot;/notifications&quot;,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      { label: &quot;Messages&quot;, path: &quot;/messages&quot;, type: NAV_ITEM_TYPES.SECONDARY },
      { label: &quot;Search&quot;, path: &quot;/search&quot;, type: NAV_ITEM_TYPES.SECONDARY },
      {
        label: &quot;Global Settings&quot;,
        path: &quot;/super-admin/settings&quot;,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
    ],
  },
  {
    label: &quot;Mode Switcher&quot;,
    path: &quot;#&quot;,
    type: NAV_ITEM_TYPES.SECONDARY,
    children: [
      {
        label: &quot;View as Rishi Management&quot;,
        path: &quot;/switch-view/rishi&quot;,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      {
        label: &quot;View as Client User&quot;,
        path: &quot;/switch-view/client&quot;,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      {
        label: &quot;View as Brand Agent&quot;,
        path: &quot;/switch-view/agent&quot;,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      {
        label: &quot;Super Admin View&quot;,
        path: &quot;/switch-view/super&quot;,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
    ],
  },
];
