import { ApiProperty } from '@nestjs/swagger';

export class AddSubscriptionDto {
  @ApiProperty()
  franchise_id: number;

  @ApiProperty()
  plan_name: string;

  @ApiProperty({ default: 'Monthly' })
  billing_cycle: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ required: false })
  start_date?: string;

  @ApiProperty({ required: false })
  end_date?: string;
}

export class AddPaymentDto {
  @ApiProperty()
  franchise_id: number;

  @ApiProperty()
  amount_paid: number;

  @ApiProperty({ required: false, default: 0 })
  due_amount?: number;

  @ApiProperty({ required: false })
  payment_date?: string;

  @ApiProperty({ required: false })
  payment_mode?: string;

  @ApiProperty({ required: false, default: 'Success' })
  payment_status?: string;

  @ApiProperty({ required: false })
  transaction_id?: string;

  @ApiProperty({ required: false })
  invoice_no?: string;

  @ApiProperty({ required: false })
  receipt_url?: string;

  @ApiProperty({ required: false })
  remarks?: string;

  created_by?: number;
}
