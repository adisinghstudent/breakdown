import App from "../App";

export default async function ChatPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const initial = typeof params?.initial === 'string' ? decodeURIComponent(params.initial) : undefined;
  return <App initialMessage={initial} />;
}
