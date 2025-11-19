'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProfileAvatarProps {
  image?: string | null
  name?: string | null
  email: string
  onImageChange: (url: string) => void
}

export default function ProfileAvatar({ image, name, email, onImageChange }: ProfileAvatarProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // TODO: Implement actual image upload to your storage service
    // This is a mock implementation
    setIsUploading(true)
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockImageUrl = URL.createObjectURL(file)
      onImageChange(mockImageUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full border-2 border-cyan-400/30 p-1 bg-gradient-to-br from-cyan-400/10 to-purple-500/10">
          {image ? (
            <Image
              src={image}
              alt={name || 'Profile'}
              width={128}
              height={128}
              className="rounded-full object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-2xl font-light text-white">
                {(name || email).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
            <div className="bg-cyan-400/80 hover:bg-cyan-400 text-black px-3 py-1 rounded-full text-sm font-medium transition-all">
              {isUploading ? 'Uploading...' : 'Change'}
            </div>
          </label>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-xl font-light text-white mb-1">{name || 'No Name'}</h2>
        <p className="text-gray-400 text-sm">{email}</p>
      </div>
    </div>
  )
}