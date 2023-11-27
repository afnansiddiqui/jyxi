import { Icon, Icons } from '@/components/Icons'
import SignOutButton from '@/components/SignOutButton'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FC, ReactNode } from 'react'
import FriendRequestSidebarOptions from '@/components/FriendRequestSideBarOption'
import { fetchRedis } from '@/helpers/redis'
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import SidebarChatList from '@/components/SidebarChatList'
import MobileChatLayout from '@/components/MobileChatLayout'
import { SidebarOption } from '@/types/typings'

interface LayoutProps {
    children: ReactNode
}

// Done after the video and optional: add page metadata
export const metadata = {
    title: 'Jyxi | Dashboard',
    description: 'Your dashboard',
}



const sidebarOptions: SidebarOption[] = [
    {
        id: 1,
        name: 'Add friend',
        href: '/dashboard/add',
        Icon: 'UserPlus',
    },
]

const Layout = async ({ children }: LayoutProps) => {
    const session = await getServerSession(authOptions)
    if (!session) notFound()

    const friends = await getFriendsByUserId(session.user.id)
    console.log('friends', friends)

    const unseenRequestCount = (
        (await fetchRedis(
            'smembers',
            `user:${session.user.id}:incoming_friend_requests`
        )) as User[]
    ).length

    return (
        <div className='w-full flex h-screen'>
            <div className='md:hidden'>
                <MobileChatLayout
                    friends={friends}
                    session={session}
                    sidebarOptions={sidebarOptions}
                    unseenRequestCount={unseenRequestCount}
                />
            </div>

            <div className='hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-white bg-black px-6'>
                <Link href='/dashboard' className='flex h-16 shrink-0 items-center'>
                    <div className='text-xl font-bold justify-center text-white'>Jyxi ⚛️ </div>
                </Link>

                {friends.length > 0 ? (
                    <div className='text-xs font-semibold leading-6 text-white'>
                        Your chats
                    </div>
                ) : null}

                <nav className='flex flex-1 flex-col'>
                    <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                        <li>
                            <SidebarChatList sessionId={session.user.id} friends={friends} />
                        </li>
                        <li>
                            <div className='text-xs font-semibold leading-6 text-white'>
                                Overview
                            </div>

                            <ul role='list' className='-mx-2 mt-2 space-y-1'>
                                {sidebarOptions.map((option) => {
                                    const Icon = Icons[option.Icon]
                                    return (
                                        <li key={option.id}>
                                            <Link
                                                href={option.href}
                                                className='text-white hover:text-green-600 hover:bg-transparent group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                                                <span className='text-white border-green-600 group-hover:border-green-600 group-hover:text-green-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-black'>
                                                    <Icon className='h-4 w-4' />
                                                </span>

                                                <span className='truncate'>{option.name}</span>
                                            </Link>
                                        </li>
                                    )
                                })}

                                <li>
                                    <FriendRequestSidebarOptions
                                        sessionId={session.user.id}
                                        initialUnseenRequestCount={unseenRequestCount}
                                    />
                                </li>
                            </ul>
                        </li>

                        <li className='-mx-6 mt-auto flex items-center'>
                            <div className='flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900'>
                                <div className='relative h-8 w-8 bg-black-50'>
                                    <Image
                                        fill
                                        referrerPolicy='no-referrer'
                                        className='rounded-full'
                                        src={session.user.image || ''}
                                        alt='Your profile picture'
                                    />
                                </div>

                                <span className='sr-only text-white'>Your profile</span>
                                <div className='flex flex-col text-white bg-black'>
                                    <span aria-hidden='true'>{session.user.name}</span>
                                    <span className='text-xs text-white' aria-hidden='true'>
                                        {session.user.email}
                                    </span>
                                </div>
                            </div>

                            <SignOutButton className='h-full aspect-ratio' />
                        </li>
                    </ul>
                </nav>
            </div>

            <aside className='max-h-screen container py-16 md:py-12 w-full bg-black border-white'>
                {children}
            </aside>
        </div>
    )
}

export default Layout