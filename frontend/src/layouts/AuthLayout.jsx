import Logo from '../components/ui/Logo.jsx';
import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx';
import Disclaimer from '../components/ui/Disclaimer.jsx';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Logo />
        <LanguageSwitcher />
      </header>
      <main className="grid flex-1 place-items-center px-4 pb-10">
        <div className="glass w-full max-w-md p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mb-6 mt-1 text-slate-600">{subtitle}</p>
          {children}
          <div className="mt-6 text-center text-[15px] text-slate-700">{footer}</div>
        </div>
      </main>
      <div className="mx-auto max-w-md px-4 pb-6"><Disclaimer /></div>
    </div>
  );
}
