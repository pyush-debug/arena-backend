import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../../logger/custom-logger.service';

/**
 * Enterprise Report SDK Service.
 * Inherited by plugins to uniformly generate PDFs, CSVs, and Excel sheets.
 */
@Injectable()
export class ReportSdkService {
  constructor(private readonly logger: CustomLoggerService) {}

  generatePdf(
    franchiseId: number,
    template: string,
    data: Record<string, unknown>,
  ): Promise<Buffer> {
    this.logger.debug(
      `Generating PDF '${template}' for Franchise ${franchiseId} with data keys: ${Object.keys(data).join(',')}`,
      'ReportSdk',
    );
    // Utilize Puppeteer or PDFKit
    return Promise.resolve(Buffer.from('%PDF-1.4 Mock PDF Stream'));
  }

  generateCsv(
    franchiseId: number,
    headers: string[],
    data: Record<string, unknown>[],
  ): Promise<string> {
    this.logger.debug(
      `Generating CSV for Franchise ${franchiseId}`,
      'ReportSdk',
    );
    const headerRow = headers.join(',') + '\n';
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    return Promise.resolve(headerRow + rows);
  }
}
