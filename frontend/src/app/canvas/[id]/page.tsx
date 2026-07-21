import { redirect } from "next/navigation";

type CanvasEditorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CanvasEditorPage({ params }: CanvasEditorPageProps) {
  const { id } = await params;

  redirect(`/studio/canvas/${id}`);
}
