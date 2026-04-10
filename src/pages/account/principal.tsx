"use client"
import { Link, Outlet, useLocation } from "react-router-dom"

type Subroutes = { name: string; href: string; }
type DashboardProps = { subroutes: Subroutes[]; }

const Dashboard: React.FC<DashboardProps> = ({ subroutes }) => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {subroutes.length > 1 && (
          <div className="mb-6">
            <nav className="flex gap-1 border-b border-gray-200">
              {subroutes.map((route) => {
                const isActive = pathname.startsWith(route.href);
                return (
                  <Link
                    key={route.href}
                    to={route.href}
                    className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px
                      ${isActive
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {route.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
