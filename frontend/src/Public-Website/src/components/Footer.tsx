import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p>&copy; {new Date().getFullYear()} Inflame. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}