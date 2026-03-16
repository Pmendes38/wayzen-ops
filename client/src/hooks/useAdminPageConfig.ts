import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { deepMerge } from "@/lib/utils";
import { useMemo } from "react";

export function useAdminPageConfig<T extends Record<string, any>>(pageKey: string, defaults: T) {
  const { user } = useAuth();
  const query = trpc.pageConfig.get.useQuery({ pageKey });

  const config = useMemo(() => {
    const stored = query.data?.config;
    if (!stored) return defaults;
    return deepMerge(defaults, stored) as T;
  }, [defaults, query.data?.config]);

  return {
    config,
    isAdmin: user?.role === "admin",
    isLoading: query.isLoading,
  };
}