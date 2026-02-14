'use client'

import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import AppSidebar from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/FirbaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Provider({ children, ...props }) {

  const { user } = useUser();

  const CreateNewUser = async () => {
    if (!user) return;

    //if user exist ?
    const userRef = doc(
      db,
      "users",
      user?.primaryEmailAddress?.emailAddress
    );

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log('Existing User');
      return;
    } else {
      const userData = {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
        createdAt: new Date(),
        remaingMsg: 5, // free user
        plan: 'Free',
        credits: 1000 // paid user
      };

      await setDoc(userRef, userData);
      console.log('New user data saved');
    }

    // if Not then  insert
  };

  useEffect(() => {
    if (user) {
      CreateNewUser();
    }
  }, [user]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <AppHeader />
          {children}
        </div>
      </SidebarProvider>
    </NextThemesProvider>
  );
}

export default Provider;
