import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { MobileNavDrawer } from './components/dashboard/MobileNavDrawer';
import { Sidebar } from './components/dashboard/Sidebar';
import { adminNavItems } from './components/dashboard/nav';

function pageTitleFor(pathname: string) {
  const match = [...adminNavItems].reverse().find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to)
  );
  return match?.label ?? 'Overview';
}

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const title = pageTitleFor(location.pathname);
  const subtitle =
    title === 'Overview' ? 'Here\u2019s what\u2019s happening with your store today.' : undefined;

  return (
    <div className="admin-dash min-h-screen bg-dash-bg text-dash-fg">
      <Sidebar onSignOut={signOut} />
      <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[232px]">
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          email={user?.email}
          onSignOut={signOut}
          onOpenMenu={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
