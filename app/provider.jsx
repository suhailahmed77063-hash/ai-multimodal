'use client'

import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import AppSidebar from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/FirbaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {AiSelectedModelContext} from "@/context/AiSelectedModelContext";
import { DefaultModel } from "@/shared/AiModelsShared";
import {UserDetailContext} from "@/context/UserDetailContext";

function Provider({ children, ...props }) {

  const { user } = useUser();
  const [aiSelectedModels,setAiSelectedModels]=useState(DefaultModel)
  const [userDetail,setUserDetail]=useState();

  const CreateNewUser = async () => {
    if (!user) return;

    const userRef = doc(
      db,
      "users",
      user?.primaryEmailAddress?.emailAddress
    );

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log('Existing User');
      const userInfo=userSnap.data();
      setAiSelectedModels(userInfo?.selectedModelPref);
      setUserDetail(userInfo);
      return;
    } else {
      const userData = {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
        createdAt: new Date(),
        remaingMsg: 5,
        plan: 'Free',
        credits: 1000
      };

      await setDoc(userRef, userData);
      console.log('New user data saved');
      setUserDetail(userData);
    }
  };

  useEffect(() => {
    if (user) {
      CreateNewUser();
    }
  }, [user]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange>
        <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
      <AiSelectedModelContext.Provider value={{aiSelectedModels,setAiSelectedModels}}>
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <AppHeader />
          {children}
        </div>
      </SidebarProvider>
      </AiSelectedModelContext.Provider>
      </UserDetailContext.Provider>
    </NextThemesProvider>
  );
}

export default Provider;
