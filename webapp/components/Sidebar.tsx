import { LayoutGrid, Activity, Settings, HelpCircle, ChevronsUpDown } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Overview 🐠', icon: LayoutGrid, active: true },
    { name: 'Sensors 🦑', icon: Activity },
  ];

  const otherItems = [
    { name: 'Setting 🦪', icon: Settings },
    { name: 'Help Center 🛟', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 flex flex-col h-screen fixed left-0 top-0 bottom-0 bg-[#0d1624]/90 border border-[#1e293b] backdrop-blur-md border-r border-[#1e293b] p-5 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/50 shadow-[0_0_15px_rgba(14,165,233,0.3)] text-slate-100 p-0.5 rounded-lg overflow-hidden flex items-center justify-center w-8 h-8">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-md" />
        </div>
        <span className="text-xl font-bold text-slate-100 tracking-tight">Coral Blue Matriix 🐳</span>
        <button className="ml-auto text-slate-400">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        </button>
      </div>

      {/* Main Menu */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-slate-400 mb-4 px-2 tracking-wider">MAIN MENU</p>
        <nav className="space-y-1">
          {menuItems.map((item: any) => (
            <a
              key={item.name}
              href="#"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active 
                  ? 'bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/50 shadow-[0_0_15px_rgba(14,165,233,0.3)] text-slate-100 shadow-md' 
                  : 'text-slate-500 hover:text-slate-200 hover:bg-[#090e17] shadow-[inset_0_0_100px_rgba(2,132,199,0.05)]'
              }`}
            >
              {item.imageIcon ? (
                <img src={item.imageIcon} alt={item.name} className="w-5 h-5 object-cover rounded-sm" />
              ) : (
                <item.icon className="w-5 h-5" />
              )}
              {item.name}
            </a>
          ))}
        </nav>
      </div>

      {/* Other Menu */}
      <div className="mb-auto">
         <p className="text-xs font-semibold text-slate-400 mb-4 px-2 tracking-wider">OTHER</p>
        <nav className="space-y-1">
          {otherItems.map((item) => (
            <a
              key={item.name}
              href="#"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-200 hover:bg-[#090e17] shadow-[inset_0_0_100px_rgba(2,132,199,0.05)] transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </a>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="pt-4 mt-4 border-t border-[#1e293b]">
        <div className="flex items-center gap-3 px-2 py-2 hover:bg-[#090e17] shadow-[inset_0_0_100px_rgba(2,132,199,0.05)] rounded-lg cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
            <span className="text-sm font-bold text-blue-800">MA</span>
            {/* Provide fake image avatar if preferred */}
             <img src={"https://i.pravatar.cc/150?u=miguel"} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold text-slate-100 truncate">Miguel Allesandro</span>
            <span className="text-xs text-slate-500 truncate">mig.allesandro@email.com</span>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
