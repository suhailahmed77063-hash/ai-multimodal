'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
function AppHeader() {
  return (
    <div className='p-3 w-full shadow flex justify-between items-center'>
     <SidebarTrigger/>
     <Button>Sign In</Button> 
    </div>
  )
}

export default AppHeader