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
    <div className="step">
      <div className="step-main">
        <div className="step-indicator" onClick={toggleProgress}>
         {step.progress === 1 ?
          <CircleCheck className="icon" />
          :
          <Circle></Circle>
         }
        </div>
        <div className="step-name">{step.name}</div>
        <div className="step-more">
          <Dots className="icon" />
        </div>
      </div>
      <div className="step-when-opened">
        <div className="step-children">
          {step.children ? step.children.map((child) => (
            <Step step={child}></Step>
          )) : undefined}
        </div>
      </div>
    </div>
  )
}

// const Wrapper = styled.div``;
// const Main = styled.div``;
// const Indicator = styled.div``;
// const Name = styled.div``;
// const More = styled.div``;
// const WhenOpenedWrapper = styled.div``;
// const Children = styled.div``;