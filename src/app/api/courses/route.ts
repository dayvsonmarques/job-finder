import { NextResponse } from "next/server";
import { searchCourses, getCourseStats } from "@/lib/course-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const modality = (searchParams.get("modality") || "all") as "all" | "presencial" | "ead" | "hibrido";
  const level = (searchParams.get("level") || "all") as "all" | "pos-graduacao" | "mestrado" | "doutorado";

  const courses = searchCourses({ query, modality, level });
  const stats = getCourseStats();

  return NextResponse.json({ courses, stats });
}
