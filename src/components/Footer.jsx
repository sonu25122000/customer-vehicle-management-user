import logo from '../assets/logo2.png';

// logo2.png is drawn on #010a18, which matches the ink background here so there's no visible box.
export default function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 pb-24 text-center sm:px-6 sm:pb-6 md:flex-row md:text-left lg:px-8">
        <img src={logo} alt="Roam Wheels" className="h-10 w-auto" />
        <p className="text-sm font-medium text-slate-300">
          Drive More <span className="mx-2 text-slate-600">|</span> Worry Less
        </p>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Roam Wheels. All rights reserved.</p>
      </div>
    </footer>
  );
}
