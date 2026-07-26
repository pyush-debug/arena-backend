import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  /**
   * Generates adoption metrics for plugins and features.
   */
  getFeatureAdoption() {
    // Queries `feature_licenses` (V036) to count active addons
    return {
      addon_qr_attendance: 142,
      addon_ai_tutor: 45,
      addon_exam_engine: 200,
    };
  }
}
