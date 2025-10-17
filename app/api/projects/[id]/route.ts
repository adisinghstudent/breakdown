import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignedTo: true,
          },
        },
        assignments: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedProject = {
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
      assignments: project.assignments.map((assignment) => ({
        ...assignment,
        employee: {
          ...assignment.employee,
          skills: JSON.parse(assignment.employee.skills),
          currentProjects: JSON.parse(assignment.employee.currentProjects),
        },
      })),
    };

    return NextResponse.json({ project: parsedProject });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
