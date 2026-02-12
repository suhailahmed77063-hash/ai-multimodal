"use client"

import React, { useState } from 'react'
import AiModelList from './../../shared/AiModelList'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch'
import { Lock, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

function AiMultiModels() {
  const [aiModelList, setAiModelList] = useState(AiModelList)

  const onToggleChange = (modelName, value) => {
    setAiModelList((prev) =>
      prev.map((m) =>
        m.model === modelName ? { ...m, enable: value } : m
      )
    )
  }

  return (
    <div className='flex flex-1 h-[75vh] border-b'>
      {aiModelList.map((model) => (
        <div
          key={model.model}
          className='flex flex-col border-r h-full flex-shrink-0'
        >
          <div
            className={`${
              model.enable ? 'w-[400px]' : 'w-[100px] flex-none'
            }`}
          >
            <div className='flex w-full h-[70px] items-center justify-between border-b p-4'>
              
              <div className='flex items-center gap-4'>
                <Image
                  src={model.icon}
                  alt={model.model}
                  width={24}
                  height={24}
                />

                {model.enable && (
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={model.subModel[0]?.name} />
                    </SelectTrigger>
                    <SelectContent>
                      {model.subModel.map((subModel, i) => (
                        <SelectItem key={i} value={subModel.name}>
                          {subModel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {model.enable ? (
                <Switch
                  checked={model.enable}
                  onCheckedChange={(v) =>
                    onToggleChange(model.model, v)
                  }
                />
              ) : (
                <MessageSquare
                  className="cursor-pointer"
                  onClick={() => onToggleChange(model.model, true)}
                />
              )}
            </div>
          </div>
         {model.premium && model.enable&& <div className='flex items-center justify-center h-full'>
        <Button> <Lock/>  Upgrade to Unlock</Button>
      </div>}
        </div>
      ))}
      
    </div>
  )
}

export default AiMultiModels
