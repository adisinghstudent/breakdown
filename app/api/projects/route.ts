import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: true,
        assignments: {
          include: {
            employee: true,
          },
        },
      },
    });

    // Parse JSON fields
    const parsedProjects = projects.map((project) => ({
      ...project,
      goals: JSON.parse(project.goals),
      requiredSkills: JSON.parse(project.requiredSkills),
      dependencies: project.dependencies ? JSON.parse(project.dependencies) : null,
      clarifyingAnswers: project.clarifyingAnswers ? JSON.parse(project.clarifyingAnswers) : null,
      tasks: project.tasks.map((task) => ({
        ...task,
        requiredSkills: JSON.parse(task.requiredSkills),
        dependencies: task.dependencies ? JSON.parse(task.dependencies) : null,
      })),
    }));

    return NextResponse.json({ projects: parsedProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const result = await prisma.project.deleteMany({});
    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('Error deleting all projects:', error);
    return NextResponse.json(
      { error: 'Failed to delete projects' },
      { status: 500 }
    );
  }
}
