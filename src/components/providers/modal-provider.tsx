// src/components/providers/modal-provider.tsx
'use client';

import { useEffect, useState } from 'react';

export function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return null; // We'll implement specific modals in components
}
