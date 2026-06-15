"use client";

import { useState, createContext, useContext } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Sidebar from "@/components/layout/Sidebar";

const MobileSidebarContext = createContext<{ open: () => void }>({ open: () => {} });

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}

export default function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider value={{ open: () => setIsOpen(true) }}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <Sidebar alwaysVisible />
        </SheetContent>
      </Sheet>
      {children}
    </MobileSidebarContext.Provider>
  );
}
