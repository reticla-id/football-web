"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RadarBackButton() {
  return (
    <Button asChild type="button" variant="ghost" className="w-fit">
      <Link href="/radar">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Radar
      </Link>
    </Button>
  );
}
