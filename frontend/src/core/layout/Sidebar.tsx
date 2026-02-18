import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { navigation, type NavItem } from '../../config/navigation';
import { useAuthContext } from '../auth/use-auth-context';
import { cn } from '../../shared/utils/cn';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasAnyPermission } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path]
    );
  };

  const IconComponent = ({ name, className }: { name: string; className?: string }) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
    return Icon ? <Icon className={cn("w-5 h-5", className)} /> : <LucideIcons.HelpCircle className={cn("w-5 h-5", className)} />;
  };

  const filterNavByPermissions = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      if (item.requiredPermissions && item.requiredPermissions.length > 0) {
        return hasAnyPermission(item.requiredPermissions);
      }
      return true;
    });
  };

  // The navigation array is imported from '../../config/navigation'.
  // To add 'Shifts' and 'Holidays', the '../../config/navigation' file itself needs to be modified.
  // As per the instructions, I am making the change within this document based on the provided snippet.
  // This implies that the user wants to define the navigation structure directly here,
  // or the provided snippet is a representation of the desired state of the 'Settings' children.
  // Assuming the latter, and that the user wants to see the effect of these items in the sidebar,
  // I will simulate the change by modifying the 'navigation' array if it were defined inline.
  // However, since it's imported, I cannot directly modify it here.
  // The most faithful interpretation given the constraints is to assume the user wants to
  // illustrate the *structure* of the change, and I should apply it to the conceptual
  // navigation structure that this component uses.
  // Since I cannot modify '../../config/navigation', I will proceed by assuming the user
  // wants to see the *effect* of these items being present in the navigation structure
  // that `filterNavByPermissions` processes.
  // This means the `navigation` constant itself, which is imported, would need to be updated
  // in its source file.
  // Given the instruction "return the full contents of the new code document after the change",
  // and the provided "Code Edit" snippet, it seems the user expects me to insert that snippet
  // into the current file. This would result in syntactically incorrect code if placed as is.
  //
  // Re-evaluating: The "Code Edit" snippet shows a list of objects that are clearly children
  // of a navigation item. The context around it in the "Code Edit" is:
  // `return items.filter((item) => {`
  // `  { name: 'Roles & Permissions', icon: ShieldCheck, path: '/settings/roles' },`
  // `  ...`
  // `],`
  // `},`
  // `];`
  // This snippet is syntactically incorrect if inserted directly into the `filterNavByPermissions` function.
  // It looks like a partial definition of the `navigation` array itself.
  //
  // The most reasonable interpretation is that the user wants to *update the definition* of the
  // `navigation` array (which is imported from `../../config/navigation`) to include these items.
  // Since I only have this file, I cannot modify `../../config/navigation`.
  //
  // I will make a comment indicating where the change *would* occur in the external file,
  // and proceed with the rest of the file as is, as I cannot directly modify the imported `navigation` array.
  // If the user intended for the `navigation` array to be defined *within* this file,
  // the instruction would need to explicitly state that, and provide the full array definition.
  //
  // Given the strict instruction "Make sure to incorporate the change in a way so that the resulting file is syntactically correct.",
  // inserting the provided snippet directly would break syntax.
  //
  // I will assume the user wants to see the *conceptual* change reflected, and the snippet
  // is a representation of the `children` array for the 'Settings' item.
  // I will add a comment to reflect this.

  // NOTE: The 'Shifts' and 'Holidays' navigation items should be added to the 'children' array
  // of the 'Settings' item within the `navigation` array defined in `../../config/navigation.ts`.
  // For example, the 'Settings' item's children should conceptually look like this:
  /*
  {
    name: 'Settings',
    icon: Settings,
    path: '/settings',
    children: [
      { name: 'Profile', icon: User, path: '/settings/profile' },
      { name: 'Roles & Permissions', icon: ShieldCheck, path: '/settings/roles' },
      { name: 'Users', icon: UserPlus, path: '/settings/users' },
      { name: 'Shifts', icon: LucideIcons.Clock, path: '/settings/shifts' }, // Added
      { name: 'Holidays', icon: LucideIcons.Calendar, path: '/settings/holidays' }, // Added
      { name: 'System Settings', icon: Settings, path: '/settings/system' },
    ],
  },
  */

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
    const isChildActive = item.children?.some((child) =>
      location.pathname === child.path
    );

    const activeClasses = 'bg-white/80 text-indigo-600 shadow-[0_15px_30px_-10px_rgba(79,70,229,0.15)] ring-1 ring-black/5 border border-white translate-x-1';
    const inactiveClasses = 'text-slate-400 hover:text-slate-900 hover:bg-white/40 transition-all duration-300';

    return (
      <div key={item.path} className="mb-2 px-3">
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleExpanded(item.path)}
              className={cn(
                'w-full flex items-center justify-between px-5 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-500',
                (isActive || isChildActive) ? activeClasses : inactiveClasses
              )}
            >
              <div className="flex items-center gap-4">
                <IconComponent 
                  name={item.icon} 
                  className={cn("transition-colors", (isActive || isChildActive) ? "text-indigo-600" : "text-slate-400")} 
                />
                {!collapsed && <span className="opacity-90">{item.name}</span>}
              </div>
              {!collapsed && (
                <LucideIcons.ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 transition-transform opacity-40',
                    isExpanded && 'rotate-180'
                  )}
                />
              )}
            </button>
            {isExpanded && !collapsed && (
              <div className="ml-9 mt-2 space-y-1 relative">
                <div className="absolute left-[-18px] top-0 bottom-2 w-px bg-slate-200/60" />
                {item.children!.map((child) => {
                  const isSubActive = location.pathname === child.path;
                  return (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={cn(
                        'block px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all relative group',
                        isSubActive 
                          ? 'text-indigo-600 bg-white/40' 
                          : 'text-slate-400 hover:text-slate-900 hover:bg-white/20'
                      )}
                    >
                      {isSubActive && <div className="absolute left-[-18px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />}
                      {child.name}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-500',
                isActive ? activeClasses : inactiveClasses
              )}
          >
            <IconComponent 
              name={item.icon} 
              className={cn("transition-colors", location.pathname === item.path ? "text-indigo-600" : "text-slate-400")} 
            />
            {!collapsed && <span className="opacity-90">{item.name}</span>}
          </NavLink>
        )}
      </div>
    );
  };

  const filteredNav = filterNavByPermissions(navigation);

  return (
    <aside
      className={cn(
        'fixed left-6 top-6 bottom-6 z-40 glass-strong transition-all duration-500 flex flex-col border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] ring-1 ring-white/10',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className={cn(
        "flex items-center justify-between mb-6 pt-8",
        collapsed ? "px-0 justify-center" : "px-8"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-4 animate-in fade-in zoom-in duration-700">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <span className="relative z-10">H</span>
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tighter block leading-none">Enterprise</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 block">Management Node</span>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "p-3 rounded-2xl bg-white/40 hover:bg-white text-slate-400 hover:text-slate-900 transition-all border border-white hover:shadow-xl hover:scale-105 active:scale-95",
            collapsed && "mx-auto"
          )}
        >
          <LucideIcons.ChevronsLeft className={cn('w-4 h-4 transition-transform duration-500', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pb-6">
        {filteredNav.map(renderNavItem)}
      </nav>

      <div className="mt-auto px-4 pb-8 space-y-4">
        {!collapsed && (
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white/40 border border-white rounded-[2rem] p-5 shadow-sm ring-1 ring-black/[0.02] backdrop-blur-xl">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">System Integrity</p>
                <span className="text-[10px] font-black text-slate-900">98.2%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100/50 rounded-full overflow-hidden p-[1px] border border-white">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.4)]" style={{ width: '98.2%' }}></div>
              </div>
            </div>
          </div>
        )}

        <div className={cn(
          "bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] p-2 transition-all duration-500 shadow-xl shadow-indigo-500/[0.05]",
          collapsed ? "mx-auto w-14" : "flex items-center gap-3 w-full"
        )}>
          <button 
            onClick={() => navigate('/settings/profile')}
            className={cn(
              "bg-slate-900 text-white rounded-[1.75rem] flex items-center justify-center font-black text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all relative overflow-hidden group shrink-0",
              collapsed ? "w-10 h-10" : "w-11 h-11"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">{user?.firstName?.[0] || 'U'}</span>
          </button>

          {!collapsed && (
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[11px] font-black text-slate-900 tracking-tighter leading-none mb-1 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-60 truncate">
                {user?.role?.name || 'System Admin'}
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-2xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 border border-transparent hover:border-rose-100 transition-all active:scale-95 group shrink-0 mr-1"
              title="Sign Out"
            >
              <LucideIcons.LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
