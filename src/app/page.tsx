import { ChatContainer } from '@/components/ChatContainer/ChatContainer'

export default function Home() {
	return (
		<main className="font-sans min-h-screen flex flex-col">
			<ChatContainer
				autoScroll
				showMessageActions
				maxHeight="1200px"
			/>
		</main>
	)
}

