"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type StudioBackButtonProps = {
  href: string;
  label: string;
};

export default function StudioBackButton({
  href,
  label,
}: StudioBackButtonProps) {
  return (
    <Button asChild type="button" variant="ghost" className="w-fit">
      <Link href={href}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}
