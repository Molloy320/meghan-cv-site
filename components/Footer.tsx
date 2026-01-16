export default function Footer() {
  return (
    <footer className="w-full px-6 py-8 border-t border-white/10">
      <div className="max-w-5xl mx-auto text-sm text-white/60 flex justify-between">
        <span>© {new Date().getFullYear()} Meghan Molloy</span>
        <span>Built with intention</span>
      </div>
    </footer>
  );
}
