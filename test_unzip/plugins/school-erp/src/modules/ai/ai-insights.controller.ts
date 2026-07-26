import { Controller, Get, Post, Body, Request } from '@nestjs/common';

@Controller('ai-insights')
export class AiInsightsController {
  
  @Post('student-summary')
  async generateStudentSummary(@Body() payload: { student_id: number }) {
    // Hooks into future AI Engine. Not bound to OpenAI or Gemini specifically.
    return { insight: 'Student shows a 15% improvement in Sciences.' };
  }

  @Post('fee-prediction')
  async predictFeeDefaulters() {
    return { insights: ['Pattern indicates 5 students may default next month based on historical delays.'] };
  }
}
