import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { chatHrefConstructor } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const page = async ({ }) => {
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const friends = await getFriendsByUserId(session.user.id)

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      const messages = await fetchRedis(
        'zrange',
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      ) as string[];

      let lastMessage = null; // Initialize lastMessage here

      // Check if there are messages for this friend
      if (messages.length > 0) {
        const [lastMessageRaw] = messages;
        lastMessage = JSON.parse(lastMessageRaw) as Message;
      }

      return {
        ...friend,
        lastMessage,
      };
    })
  );

  return (
    <div className='container py-12'>
      <h1 className='font-bold text-5xl mb-8 text-white'>Recent chats 😍</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className='text-sm text-white'>Nothing to show here...</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div
            key={friend.id}
            className='relative bg-black border border-white p-3 rounded-md'
          >
            <div className='absolute right-4 inset-y-0 flex items-center'>
              <ChevronRight className='h-7 w-7 text-white' />
            </div>

            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                session.user.id,
                friend.id
              )}`}
              className='relative sm:flex text-white'
            >
              <div className='mb-4 flex-shrink-0 sm:mb-0 sm:mr-4'>
                <div className='relative h-6 w-6'>
                  <Image
                    referrerPolicy='no-referrer'
                    className='rounded-full'
                    alt={`${friend.name} profile picture`}
                    src={friend.image}
                    fill
                  />
                </div>
              </div>

              <div>
                <h4 className='text-lg font-semibold text-white bg-black'>{friend.name}</h4>
                <p className='mt-1 max-w-md'>
                  <span className='text-white bg-black'>
                    {friend.lastMessage?.senderId === session.user.id
                      ? 'You: '
                      : ''}
                  </span>
                  {friend.lastMessage?.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default page;
