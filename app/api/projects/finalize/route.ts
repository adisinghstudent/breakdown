import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ProjectDefinition } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { projectId, answers, projectData } = await req.json() as {
      projectId: string;
      answers: Record<string, string | string[]>;
      projectData: Partial<ProjectDefinition>;
    };

    // Save project to database
    const project = await prisma.project.create({
      data: {
        id: projectId,
        title: projectData.title!,
        description: projectData.description!,
        goals: JSON.stringify(projectData.goals || []),
        deadline: projectData.deadline,
        timelinePreference: projectData.timelinePreference || 'moderate',
        effortLevel: projectData.effortLevel!,
        teamSize: projectData.teamSize,
        requiredSkills: JSON.stringify(projectData.requiredSkills || []),
        priority: projectData.priority || 'medium',
        dependencies: projectData.dependencies ? JSON.stringify(projectData.dependencies) : null,
        budgetHours: projectData.budgetHours,
        budgetAmount: projectData.budgetAmount,
        clarifyingAnswers: JSON.stringify(answers),
        status: 'planning',
      },
    });

    // TODO: Trigger AI workflow to:
    // 1. Create GitHub repository
    // 2. Generate task breakdown
    // 3. Assign tasks to employees based on skills/availability
    // 4. Create GitHub issues
    // 5. Spawn codex nodes for each task

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
      },
    });
  } catch (error) {
    console.error('Error finalizing project:', error);
    return NextResponse.json(
      { error: 'Failed to finalize project' },
      { status: 500 }
    );
  }
}
