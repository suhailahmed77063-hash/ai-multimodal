"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {  Moon, Sun, User2, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import UsageCreditProgress from "./UsageCreditProgress";
import PaymentModal from "./PaymentModal";
import { useContext } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";

function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const {user}=useUser();
  const { userDetail } = useContext(UserDetailContext);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3">
          <div className=" flex justify-between items-center ">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="logo"
                width={60}
                height={60}
                className="w-[40px] h-[40px]"
              />
              <h2 className="font-bold text-xl">Ai Webnar</h2>
            </div>

            <div>
              {mounted && (
                theme === "light" ? (
                  <Button
                    variant="ghost"
                    onClick={() => setTheme("dark")}
                  >
                    <Sun />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setTheme("light")}
                  >
                    <Moon />
                  </Button>
                )
              )}
            </div>
          </div>
         {user ? (
        <Button className='mt-7 w-full' size="lg">
        + New Chat
      </Button>
           ) : (
          <SignInButton>
       <Button className='mt-7 w-full' size="lg">
      + New Chat
      </Button>
        </SignInButton>
    )}

        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className={'p-3'}>
            <h2 className="font-bold text-lg">Chat</h2>
            {!user &&<p className="text-sm text-gray-400">
              Sign in to start chating with mutiple AI model
            </p>}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 mb-10">
         {!user? <SignInButton mode="modal">
            <Button className={'w-full'} size={'lg'}>
            Sign In/Sign Up
          </Button>
          </SignInButton>
          :
          <div>
            <UsageCreditProgress/>
            <Button 
              className={'w-full mb-3'}
              onClick={() => setShowPaymentModal(true)}
            >
              <Zap/>Upgrade Plan
              </Button>
          <Link href="/profile">
            <Button className="flex w-full" variant={'ghost'}>
              <User2/> 
              <h2>Profile</h2>
            </Button>
          </Link>
          </div>
         }
        </div>
      </SidebarFooter>
      
      <PaymentModal 
        open={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
    </Sidebar>
  );
}

export default AppSidebar;
