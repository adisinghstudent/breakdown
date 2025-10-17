import App from "../App";

export default function ChatPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const initial = typeof searchParams?.initial === 'string' ? decodeURIComponent(searchParams!.initial) : undefined;
  return <App initialMessage={initial} />;
}
