"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const IDLE_TIMEOUT_MS = 60 * 1000;
const WARNING_BEFORE_MS = 20 * 1000;
const AUTH_CHECK_INTERVAL_MS = 5 * 60 * 1000;

const BTN_CLASS = "swal-btn-green";

export function useSessionTimeout() {
  const router = useRouter();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimer();

    idleTimerRef.current = setTimeout(async () => {
      const result = await Swal.fire({
        title: "Sesi Akan Berakhir",
        text: "Anda tidak melakukan aktivitas selama 40 detik. Sesi akan berakhir dalam 20 detik.",
        icon: "warning",
        timer: WARNING_BEFORE_MS,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: "Saya masih di sini",
        confirmButtonColor: "#16a34a",
        showCancelButton: false,
        allowOutsideClick: false,
        customClass: { confirmButton: BTN_CLASS },
        willClose: () => {
          clearIdleTimer();
        },
      });

      if (result.dismiss === Swal.DismissReason.timer) {
        try {
          await fetch("/api/admin/logout", { method: "POST" });
        } catch {}
        router.push("/admin/login");
      } else {
        resetIdleTimer();
      }
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
  }, [clearIdleTimer, router]);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "swal-btn-style";
    style.textContent = `
  .${BTN_CLASS}.swal2-styled:hover,
  .${BTN_CLASS}.swal2-styled:focus,
  .${BTN_CLASS}.swal2-styled:active {
    background-color: #16a34a !important;
    filter: none !important;
    box-shadow: none !important;
  }
`;
    document.head.appendChild(style);

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    const handleActivity = () => resetIdleTimer();

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetIdleTimer();

    // Periodic auth check — detect server-side expiry
    authCheckRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) {
          await Swal.fire({
            title: "Sesi Berakhir",
            text: "Sesi Anda telah berakhir. Silakan login kembali.",
            icon: "info",
            confirmButtonText: "OK",
            confirmButtonColor: "#16a34a",
            customClass: { confirmButton: BTN_CLASS },
          });
          router.push("/admin/login");
        }
      } catch {}
    }, AUTH_CHECK_INTERVAL_MS);

    return () => {
      const el = document.getElementById("swal-btn-style");
      if (el) el.remove();
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearIdleTimer();
      if (authCheckRef.current) clearInterval(authCheckRef.current);
    };
  }, [resetIdleTimer, clearIdleTimer, router]);
}
