import { useCallback } from "react";

/**
 * Hook para navegação de volta
 * Tenta voltar no histórico do navegador, ou navega para home se não houver histórico
 */
export function useGoBack() {
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  }, []);

  return goBack;
}
