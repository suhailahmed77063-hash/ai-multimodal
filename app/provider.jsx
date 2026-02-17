'use client'

import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import AppSidebar from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import {AiSelectedModelContext} from "@/context/AiSelectedModelContext";
import { DefaultModel } from "@/shared/AiModelsShared";
import {UserDetailContext} from "@/context/UserDetailContext";
import axios from "axios";

function Provider({ children, ...props }) {

  const { user, isLoaded } = useUser();
  const [aiSelectedModels,setAiSelectedModels]=useState(DefaultModel)
  const [userDetail,setUserDetail]=useState();
  const [messages,setMessages]=useState([])

  const CreateNewUser = async () => {
    if (!user) return;

    try {
      const response = await axios.post('/api/user/create', {
        email: user?.primaryEmailAddress?.emailAddress,
        name: user?.fullName,
      });

      const userData = response.data;
      
      if (userData?.selectedModelPref) {
        setAiSelectedModels(userData.selectedModelPref);
      }
      
      setUserDetail(userData);
    } catch (error) {
      console.error('Error creating/fetching user:', error);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      CreateNewUser();
    }
  }, [user, isLoaded]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange>
        <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
      <AiSelectedModelContext.Provider value={{aiSelectedModels,setAiSelectedModels,messages,setMessages}}>
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
