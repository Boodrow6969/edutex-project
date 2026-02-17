'use client';

import type {
  CourseAnalysisFormData,
  AudienceProfileData,
  AnalysisTaskData,
  StakeholderSubmissionDisplay,
} from '@/lib/types/courseAnalysis';
import ProjectOverviewHeader from './ProjectOverviewHeader';
import AudienceProfiles from './AudienceProfiles';
import TasksCompetencies from './TasksCompetencies';
import TrainingDecision from './TrainingDecision';
import SuccessCriteria from './SuccessCriteria';

interface AnalysisTabProps {
  data: CourseAnalysisFormData;
  onChange: (updates: Partial<CourseAnalysisFormData>) => void;
  submissions: StakeholderSubmissionDisplay[];
}

export default function AnalysisTab({ data, onChange, submissions }: AnalysisTabProps) {
  const handleAudiencesChange = (audiences: AudienceProfileData[]) => {
    onChange({ audiences });
  };

  const handleTasksChange = (tasks: AnalysisTaskData[]) => {
    onChange({ tasks });
  };

  return (
    <div className="space-y-4">
      {/* Section 1: Project Overview (from stakeholder data) */}
      <ProjectOverviewHeader submissions={submissions} />

      {/* Section 2: Audience Profiles */}
      <AudienceProfiles
        audiences={data.audiences}
        onChange={handleAudiencesChange}
        submissions={submissions}
      />

      {/* Section 3: Tasks & Competencies */}
      <TasksCompetencies
        tasks={data.tasks}
        onChange={handleTasksChange}
        audiences={data.audiences}
        submissions={submissions}
      />

      {/* Section 4: Training Decision & Constraints */}
      <TrainingDecision
        data={data}
        onChange={onChange}
        submissions={submissions}
      />

      {/* Section 5: Success Criteria */}
      <SuccessCriteria
        data={data}
        onChange={onChange}
        submissions={submissions}
      />
    </div>
  );
}
