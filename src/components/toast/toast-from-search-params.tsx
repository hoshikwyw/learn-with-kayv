"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const MESSAGES: Record<string, { kind: "success" | "error"; text: string }> = {
  signed_in: { kind: "success", text: "Signed in successfully." },
  signed_out: { kind: "success", text: "You've been signed out." },
};

export function ToastFromSearchParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lastFiredRef = useRef<string | null>(null);

  useEffect(() => {
    const toastKey = searchParams.get("toast");
    const errorMessage = searchParams.get("error");

    // Toast key (success/info messages from known actions)
    if (toastKey && MESSAGES[toastKey] && lastFiredRef.current !== toastKey) {
      const m = MESSAGES[toastKey];
      lastFiredRef.current = toastKey;
      if (m.kind === "success") toast.success(m.text);
      else toast.error(m.text);
      stripParam("toast");
    }

    // Error param (raw text from server actions / callbacks)
    if (errorMessage && lastFiredRef.current !== `error:${errorMessage}`) {
      lastFiredRef.current = `error:${errorMessage}`;
      toast.error(errorMessage);
      stripParam("error");
    }

    function stripParam(name: string) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);
      const search = params.toString();
      router.replace(`${pathname}${search ? `?${search}` : ""}`, {
        scroll: false,
      });
    }
  }, [searchParams, router, pathname]);

  return null;
}
