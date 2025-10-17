import { NextRequest, NextResponse } from 'next/server';
import type { ProjectDefinition, ProjectSetupResponse, ClarifyingQuestion } from '@/lib/types';

// This would be your OpenAI ChatKit workflow ID for project clarification
const CLARIFICATION_WORKFLOW_ID = process.env.NEXT_PUBLIC_CLARIFICATION_WORKFLOW_ID || '';

export async function POST(req: NextRequest) {
  try {
    const projectData: Partial<ProjectDefinition> = await req.json();

    // Validate required fields
    if (!projectData.title || !projectData.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Generate a temporary project ID
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store project data (in-memory for now, replace with database)
    // TODO: Save to database
    console.log('Project data received:', { projectId, ...projectData });

    // Call AI agent to generate clarifying questions
    const clarifyingQuestions = await generateClarifyingQuestions(projectData);

    if (clarifyingQuestions && clarifyingQuestions.length > 0) {
      return NextResponse.json<ProjectSetupResponse>({
        projectId,
        clarifyingQuestions,
        status: 'needs_clarification',
      });
    }

    // If no clarifying questions needed, proceed with setup
    return NextResponse.json<ProjectSetupResponse>({
      projectId,
      status: 'ready_to_setup',
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

/**
 * Use AI to generate clarifying questions based on project definition
 */
async function generateClarifyingQuestions(
  projectData: Partial<ProjectDefinition>
): Promise<ClarifyingQuestion[] | null> {
  // TODO: Integrate with ChatKit workflow or OpenAI API to generate questions

  // For now, return mock questions based on project data
  const questions: ClarifyingQuestion[] = [];

  // If no specific technologies mentioned, ask
  if (projectData.description &&
      !projectData.description.toLowerCase().includes('react') &&
      !projectData.description.toLowerCase().includes('vue') &&
      !projectData.description.toLowerCase().includes('angular')) {
    questions.push({
      question: 'Which frontend framework would you prefer?',
      type: 'choice',
      options: ['React', 'Vue', 'Angular', 'Svelte', 'No preference'],
      required: false,
    });
  }

  // If backend mentioned but no database specified
  if (projectData.description &&
      projectData.requiredSkills?.includes('backend') &&
      !projectData.description.toLowerCase().includes('postgres') &&
      !projectData.description.toLowerCase().includes('mongodb')) {
    questions.push({
      question: 'Which database system should we use?',
      type: 'choice',
      options: ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite', 'No preference'],
      required: false,
    });
  }

  // If deployment not mentioned
  if (projectData.description &&
      !projectData.description.toLowerCase().includes('deploy') &&
      !projectData.description.toLowerCase().includes('hosting')) {
    questions.push({
      question: 'Where should this be deployed?',
      type: 'choice',
      options: ['Vercel', 'AWS', 'Google Cloud', 'Self-hosted', 'TBD'],
      required: false,
    });
  }

  // Ask about testing requirements
  questions.push({
    question: 'What level of test coverage do you need?',
    type: 'choice',
    options: ['Unit tests only', 'Unit + Integration', 'Full E2E coverage', 'Minimal'],
    required: true,
  });

  // Ask about code style/conventions
  if (projectData.requiredSkills && projectData.requiredSkills.length > 0) {
    questions.push({
      question: 'Any specific coding standards or style guides to follow?',
      type: 'text',
      required: false,
    });
  }

  return questions.length > 0 ? questions : null;
}

/**
 * Alternative: Call OpenAI ChatKit workflow for clarifying questions
 *
 * @param _projectData - The project data to generate questions for
 * @returns Array of clarifying questions or null
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateClarifyingQuestionsWithAI(
  _projectData: Partial<ProjectDefinition>
): Promise<ClarifyingQuestion[] | null> {
  if (!CLARIFICATION_WORKFLOW_ID) {
    console.warn('No clarification workflow ID configured');
    return null;
  }

  // TODO: Implement AI-powered clarifying questions
  // This would integrate with your ChatKit workflow
  return null;
}
