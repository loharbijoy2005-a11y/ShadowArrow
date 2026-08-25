export interface AuditLog {
  id: string;
  admin: string;
  action: string;
  target: string;
  role: string;
  timestamp: string;
}

export function logAdminAction(
  action: string,
  target: string,
  admin: string = 'Bijoy Lohar (Super Admin)',
  role: string = 'Super Admin'
) {
  if (typeof window === 'undefined') return;

  const existingLogsStr = localStorage.getItem('shadow_audit_logs');
  let logs: AuditLog[] = [];

  const defaultLogs: AuditLog[] = [
    { id: '1', admin: 'Bijoy Lohar (Super Admin)', action: 'Updated Product Stock & Pricing', target: 'SKU: SA-OVER-001', role: 'Super Admin', timestamp: '2026-08-17 16:35:10' },
    { id: '2', admin: 'Rohan Sharma', action: 'Changed Order Status to SHIPPED', target: 'Order #SA-89472', role: 'Manager', timestamp: '2026-08-17 15:42:00' },
    { id: '3', admin: 'Vikram Singh', action: 'Batch Printed 12 Thermal Labels', target: 'Orders #SA-89460 - #SA-89472', role: 'Delivery Staff', timestamp: '2026-08-17 14:18:22' },
    { id: '4', admin: 'Bijoy Lohar (Super Admin)', action: 'Created Promo Coupon SHADOW10', target: 'Discount 10%', role: 'Super Admin', timestamp: '2026-08-17 12:05:44' },
  ];

  if (existingLogsStr) {
    try {
      logs = JSON.parse(existingLogsStr);
    } catch (e) {
      logs = defaultLogs;
    }
  } else {
    logs = defaultLogs;
  }

  const newLog: AuditLog = {
    id: Date.now().toString(),
    admin,
    action,
    target,
    role,
    timestamp: new Date().toLocaleString('en-IN'),
  };

  const updatedLogs = [newLog, ...logs];
  localStorage.setItem('shadow_audit_logs', JSON.stringify(updatedLogs));
}
