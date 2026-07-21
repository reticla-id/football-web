import CanvasEditorClient from "@/app/canvas/[id]/CanvasEditorClient";

type StudioCanvasEditorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudioCanvasEditorPage({
  params,
}: StudioCanvasEditorPageProps) {
  const { id } = await params;

  return <CanvasEditorClient id={id} />;
}
