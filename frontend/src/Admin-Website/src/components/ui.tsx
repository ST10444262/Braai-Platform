"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight, CloudUpload, LoaderCircle, X } from "lucide-react";

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm outline-none transition placeholder:text-muted/60 focus:border-ink/40 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";

/* ---------- Toasts ---------- */
const ToastCtx = createContext<(msg: string, type?: "ok" | "err") => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string; type: string }[]>([]);
  const push = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setItems((i) => [...i, { id, msg, type }]);
    setTimeout(() => setItems((i) => i.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg",
              t.type === "err" ? "bg-red-600" : "bg-ink",
            )}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Buttons ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: BtnProps) {
  const v = {
    primary: "bg-ink text-white hover:bg-black/85",
    secondary: "border border-line bg-white text-ink hover:bg-card",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
    ghost: "text-muted hover:bg-card hover:text-ink",
  }[variant];
  const s = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        v,
        s,
        className,
      )}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/* ---------- Badges ---------- */
const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  New: { label: "New", cls: "bg-orange-50 text-orange-600", dot: "bg-orange-500" },
  "Under Review": { label: "Under Review", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Contacted: { label: "Contacted", cls: "bg-stone-200/70 text-stone-800", dot: "bg-stone-800" },
  Converted: { label: "Converted", cls: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  Dead: { label: "Dead", cls: "bg-stone-100 text-stone-500", dot: "bg-stone-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.New;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium", s.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function Pill({ children, tone = "grey" }: { children: ReactNode; tone?: "grey" | "dark" | "purple" | "red" | "green" }) {
  const t = {
    grey: "bg-stone-100 text-stone-600",
    dark: "bg-ink text-white",
    purple: "bg-violet-100 text-violet-700",
    red: "bg-red-50 text-red-600",
    green: "bg-emerald-50 text-emerald-700",
  }[tone];
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium", t)}>{children}</span>;
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      className="grid shrink-0 place-items-center rounded-full bg-stone-200 font-semibold text-stone-700"
    >
      {initials || "?"}
    </div>
  );
}

/* ---------- Layout helpers ---------- */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl border border-line bg-card p-6", className)}>{children}</div>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function Chips({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed",
            value === o ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-card",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("grid place-items-center py-16 text-muted", className)}>
      <LoaderCircle className="h-6 w-6 animate-spin" />
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}

export function Pagination({
  page,
  pageSize,
  total,
  noun,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  noun: string;
  onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const start = Math.max(1, Math.min(page - 1, pages - 2));
  const nums = Array.from({ length: Math.min(3, pages) }, (_, i) => start + i);
  const b = "grid h-7 w-7 place-items-center rounded-md border border-line bg-white text-xs disabled:opacity-40";
  return (
    <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-muted">
      <span>
        Showing {from}-{to} of {total} {noun}
      </span>
      <div className="flex items-center gap-1.5">
        <button className={b} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-3 w-3" />
        </button>
        {nums.map((n) => (
          <button key={n} onClick={() => onChange(n)} className={cn(b, n === page && "border-ink bg-ink text-white")}>
            {n}
          </button>
        ))}
        <button className={b} disabled={page >= pages} onClick={() => onChange(page + 1)}>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Overlays ---------- */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  headerRight,
  footer,
  children,
  width = "max-w-[440px]",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        onClick={onClose}
        className={cn("absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity", open ? "opacity-100" : "opacity-0")}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300",
          width,
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{title}</h2>
            {subtitle && <p className="mt-1 text-[11px] text-muted">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {headerRight}
            <button onClick={onClose} className="text-muted hover:text-ink">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
      </aside>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">{message}</p>
    </Modal>
  );
}

export function Dropzone({
  onFiles,
  accept,
  multiple = true,
  title,
  hint,
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title: string;
  hint: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const fs = Array.from(e.dataTransfer.files);
        if (fs.length) onFiles(fs);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition",
        over ? "border-ink bg-card" : "border-stone-300 bg-card/60 hover:bg-card",
      )}
    >
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const fs = Array.from(e.target.files ?? []);
          if (fs.length) onFiles(fs);
          e.target.value = "";
        }}
      />
      <div className="grid h-9 w-9 place-items-center rounded-full bg-white">
        <CloudUpload className="h-4 w-4 text-muted" />
      </div>
      <div className="text-xs font-medium">{title}</div>
      <div className="text-[10px] text-muted">{hint}</div>
    </div>
  );
}