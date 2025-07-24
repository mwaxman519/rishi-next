import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return basic documentation info
    return NextResponse.json({
      title: "Rishi Platform Documentation",
      description: "Comprehensive documentation for the Rishi Platform",
      version: "1.0.0",
      sections: [
        {
          id: "getting-started",
          title: "Getting Started",
          description: "Basic setup and introduction to the platform"
        },
        {
          id: "api-reference",
          title: "API Reference",
          description: "Complete API documentation"
        },
        {
          id: "user-guide",
          title: "User Guide",
          description: "End-user documentation and tutorials"
        }
      ]
    });
  } catch (error) {
    console.error("Error loading documentation:", error);
    return NextResponse.json(
      { error: "Failed to load documentation" },
      { status: 500 }
    );
  }
}