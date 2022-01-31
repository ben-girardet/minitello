import { Step  as StepModel } from '@prisma/client';
import { Circle, CircleCheck, Dots } from 'tabler-icons-react';
import { useFetcher } from 'remix';
import styled from 'styled-components';

export interface StepWithChildren extends StepModel {
  children?: StepWithChildren[];
}

export function Step({step}: {step: StepWithChildren}) {

  const fetcher = useFetcher();

  function toggleProgress() {
    const action = 'toggle-progress';
    const projectId = step.projectId as string;
    const stepId = step.id;
    fetcher.submit({action, projectId, stepId}, {method: 'put', action: `/projects/${projectId}`});
  }

  return (
    <Wrapper>
      <Main>
        <Indicator onClick={toggleProgress}>
         {step.progress === 1 ?
          <CircleCheck className="icon" />
          :
          <Circle></Circle>
         }
        </Indicator>
        <Name>{step.name}</Name>
        <More>
          <Dots className="icon" />
        </More>
      </Main>
      <WhenOpenedWrapper>
        <Children>
          {step.children ? step.children.map((child) => (
            <Step step={child}></Step>
          )) : undefined}
        </Children>
      </WhenOpenedWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 8px;
  background: hsl(0, 0%, 100%);
  margin: 1px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-foreground);
  cursor: pointer;
`;
const Main = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;
const Indicator = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-align: center;
`;
const Name = styled.div`
  width: 100%;
`;
const More = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;
const WhenOpenedWrapper = styled.div``;
const Children = styled.div``;

/*
.step-creator input {
  width: 100%;
  font-size: 16px;;
}
.step-creator-inactive {
  opacity: 0.5;
}
.step-creator .step-indicator {
  opacity: 0.5;
}
.step-creator:not(.step-creator-can-save) .step-more {
  opacity: 0.5;
}
.step-creator:not(.step-creator-is-started) .step-indicator > * {
  visibility: hidden;
}
*/