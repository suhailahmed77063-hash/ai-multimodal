"use client";

import { Progress } from '@/components/ui/progress'
import React, { useContext } from 'react'
import { UserDetailContext } from '@/context/UserDetailContext'

function UsageCreditProgress() {
  const { userDetail } = useContext(UserDetailContext);
  
  const credits = userDetail?.credits || 0;
  const maxCredits = userDetail?.plan === 'Enterprise' ? 5000 : userDetail?.plan === 'Pro' ? 1000 : 100;
  const usedCredits = maxCredits - credits;
  const progressPercent = Math.max(0, Math.min(100, (usedCredits / maxCredits) * 100));
  const planName = userDetail?.plan || 'Free';

  return (
    <div className='p-3 border rounded-2xl mb-5 flex flex-col gap-2'>
      <h2 className='font-bold text-xl'>{planName} Plan</h2>
      <p className='text-gray-400'>{usedCredits}/{maxCredits} credits used</p>
      <Progress value={progressPercent} />
      <p className='text-xs text-gray-500'>{credits} credits remaining</p>
    </div>
  )
}

export default UsageCreditProgress