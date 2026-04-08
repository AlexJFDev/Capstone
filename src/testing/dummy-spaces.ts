// Static fixture data: a set of dummy Space records referencing dummy workspaces and visualizations, used for development and testing.
import type { Space } from '@/types/spaces'

export const spaces: Record<string, Space> = {
  's-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee01': {
    name: 'Web Platform',
    description:
      'Tracks all work for the **web platform** across frontend and backend teams.\n\n- Sprint planning and quarterly roadmaps\n- Bug and task backlogs',
    color: '#4A90D9',
    workspaceIds: [
      'w-1a2b3c4d-5e6f-4890-abcd-ef1234567890',
      'w-2b3c4d5e-6f7a-4901-bcde-f12345678901',
    ],
    visualizationIds: [
      'v-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee01',
      'v-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee02',
      'v-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee03',
    ],
  },
  's-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee02': {
    name: 'Infrastructure',
    description:
      'DevOps and QA work for **deployment pipelines** and quality assurance.\n\n- Release timelines and bug tracking',
    color: '#1ABC9C',
    workspaceIds: [
      'w-3c4d5e6f-7a8b-4012-8def-123456789012',
      'w-4d5e6f7a-8b9c-4123-8efa-234567890123',
    ],
    visualizationIds: [
      'v-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee04',
      'v-aaaa1111-bbbb-4ccc-8ddd-eeeeeeeeee05',
    ],
  },
}
