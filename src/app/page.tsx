import { ConversationView } from '@/components/ConversationView'

export default function Home() {
	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<ConversationView
				isLoading={false}
				messages={[
					{
						id: '1',
						role: 'user',
						content: 'Hello, how are you?',
						timestamp: new Date(),
						status: 'complete',
					},
					{
						id: '2',
						role: 'assistant',
						content: 'I am fine, thank you!',
						timestamp: new Date(),
						status: 'streaming',
					},
				]}
			/>
		</div>
	)
}
