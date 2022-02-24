import { DataFunctionArgs } from "@remix-run/server-runtime";
import { useEffect, useState, MouseEvent } from "react";
import { Link, redirect, useLoaderData, ActionFunction, MetaFunction, json, useActionData, useTransition } from "remix";
import styled from "styled-components";
import { ChevronLeft } from "tabler-icons-react";
import Button from "~/components/button";
import Stack from "~/components/stack";
import { Step } from "~/components/step";
import StepCreator from "~/components/step-creator";
import { db } from "~/utils/db.server";
import { FormResult, getFormDataAsString, isString, FormResultGlobalError } from "~/utils/form";
import { getUser, requireUserId } from "~/utils/session.server";
import { StepUtil } from "~/utils/step";
import StepEditor from '~/components/step-editor';
import { Step as StepModel } from "@prisma/client";
import PubSub from 'pubsub-js';

export const meta: MetaFunction = ({data}: {data: Awaited<ReturnType<typeof loader>>}) => {
  return {
    title: `Minitello - ${data.project.name}`,
    description: data.project.description || ''
  };
};

export const loader = async ({request, params}: DataFunctionArgs) => {
  const user = await getUser(request);
  if (!user) {
    throw redirect(`/login`);
  }

  const projectId = params.projectId;
  if (!isString(projectId)) {
    throw new Error('Invalid projectId');
  }

  const project = await db.step.findUnique({
    where: {
      id: projectId,
    },
    select: { id: true, name: true, description: true, members: true }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const steps = await StepUtil.getProjectsSteps({project, userId: user.id, computeChildren: true});
  const data = {
    project,
    user,
    steps: steps.filter(s => !s.parentStepId || s.parentStepId === projectId),
  };
  return data;
}

export const action: ActionFunction = async ({
  request
}) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const action = getFormDataAsString(form, '_action');
  try {
    if (action === 'create-step') {
      const newStep = await StepUtil.createFromCreator({form, userId});
      if (!newStep) {
        throw FormResultGlobalError(`Failed to create the step`);
      }
      return newStep;
    } else if (action === 'edit-step') {
      return await StepUtil.editStepFromEditor({form, userId});
    } else if (action === 'toggle-progress') {
      return await StepUtil.toggleProgress({form, userId});
    } else if (action === 'move-step') {
      return await StepUtil.moveStep({form, userId});
    } else if (action === 'delete-step') {
      await StepUtil.deleteStep({form, userId});
      return json({}, 200);
    } else if (action === 'duplicate-step') {
      await StepUtil.duplicateStep({form, userId});
      return json({}, 200);
    } else {
      throw FormResultGlobalError(`Invalid action`);
    }
  } catch (error) {
    return json(error as FormResult, {status: 400});
  }
};

export default function Index() {

  const {project, steps} = useLoaderData<Awaited<ReturnType<typeof loader>>>();
  const actionData = useActionData();
  const transition = useTransition();

  useEffect(() => {
    if (transition.state === 'idle') {
      document?.querySelectorAll('.step-creator').forEach((el) => {
        if (el instanceof HTMLInputElement && el.value) {
          // we found a step-creator non-empty
          // we can assume it is the one that sent the action

          // first we reset it
          el.value = '';

          // second we scroll it into view for next input
          el.scrollIntoView({behavior: 'smooth'});
        }
      });
    }
  }, [transition.state]);

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingStep, setEditingStep] = useState<StepModel | undefined>(undefined);

  function startEditingStep(msgstep: string, step: StepModel): void {
    setEditingStep(step);
    setIsEditorOpen(true);
  }

  useEffect(() => { 
    const token = PubSub.subscribe('edit-step', startEditingStep);
    return function cleanup () {
      PubSub.unsubscribe(token);
    }
  }, []);

  function dismissStepEditor(event: MouseEvent) {
    event.stopPropagation();
    setIsEditorOpen(false);
    setEditingStep(undefined);
  }

  function saveStepEditor(event: MouseEvent) {
    event.stopPropagation();
    setIsEditorOpen(false);
    setEditingStep(undefined);
  }

  return (
    <Wrapper>
      <Stack size="large">
        <h1>
          <Link to="../projects">
            <Button variant="ghost" size="medium">
              <ChevronLeft></ChevronLeft>
            </Button>
            </Link>
          {project.name}
        </h1>
        <div>
          {steps.map(step => (
            <Step step={step} key={step.id}></Step>
          ))}
          <StepCreator
            projectId={project.id}
            parentStepId={project.id}
            formResult={actionData?._globalCreateStep}
            processing={transition.state === 'submitting'}
            ></StepCreator>
        </div>
      </Stack>
      <StepEditor
        isOpen={isEditorOpen}
        onDismiss={dismissStepEditor}
        onSave={saveStepEditor}
        actionData={actionData}
        step={editingStep!}
      ></StepEditor>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: var(--large-container-width);
  max-width: calc(100% - var(--gutter) * 2);
  margin-top: var(--gutter);
  margin-right: auto;
  margin-left: auto;
`;