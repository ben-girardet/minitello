import { DataFunctionArgs } from "@remix-run/server-runtime";
import { useEffect } from "react";
import { Link, redirect, useLoaderData, ActionFunction, json, useActionData, useTransition } from "remix";
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
    select: { id: true, name: true, members: true }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // TODO: ensure current user has the rights on the project

  const steps = await db.step.findMany({
    where: {
      projectId
    }
  });

  const data = {
    project,
    user,
    steps,
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
    } else if (action === 'toggle-progress') {
      return await StepUtil.toggleProgress({form, userId});
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