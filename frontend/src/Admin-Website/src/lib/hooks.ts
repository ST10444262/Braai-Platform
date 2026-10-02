"use client";

import { useEffect, useState } from "react";
import { api, qs } from "./api";
import { useAuth } from "./auth";
import type { Product, Staff } from "./types";

export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fn()
      .then((d) => {
        if (alive) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { data, error, loading, reload: () => setTick((t) => t + 1) };
}

/** productId -> name, used to label leads (best effort). */
export function useProductNames(): Record<string, string> {
  const { data } = useLoad(async () => {
    try {
      const list = await api.get<Product[]>(`/admin/products${qs({ pageNumber: 1, pageSize: 1000 })}`);
      return Object.fromEntries(list.map((p) => [p.productId, p.name])) as Record<string, string>;
    } catch {
      return {} as Record<string, string>;
    }
  });
  return data ?? {};
}

/** staffId -> Staff. Only Admin+ may call the staff endpoint, so Employees get an empty map. */
export function useStaffDirectory(): Record<string, Staff> {
  const { isAdmin, ready } = useAuth();
  const { data } = useLoad(
    async () => {
      if (!isAdmin) return {} as Record<string, Staff>;
      try {
        const list = await api.get<Staff[]>(`/admin/account/staff${qs({ pageNumber: 1, pageSize: 1000 })}`);
        return Object.fromEntries(list.map((s) => [s.staffId, s])) as Record<string, Staff>;
      } catch {
        return {} as Record<string, Staff>;
      }
    },
    [isAdmin, ready],
  );
  return data ?? {};
}