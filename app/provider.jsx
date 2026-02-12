'use client'

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import AppSidebar from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
function Provider({ children, ...props }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <SidebarProvider>
        <AppSidebar/>
      <div className="w-full">
      <AppHeader/>{children}</div>
      </SidebarProvider>
    </NextThemesProvider>
  );
}

export default Provider;