import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | BMKG – Stasiun Meteorologi Maritim Tegal`;
  }, [title]);
}
