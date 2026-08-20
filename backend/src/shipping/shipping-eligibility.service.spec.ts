// shipping/shipping-eligibility.service.spec.ts
import { ShippingEligibilityService } from './shipping-eligibility.service';
import { ShippingCostOption } from './rajaongkir.service';

function svc(service: string, description: string, category: 'REGULAR' | 'CARGO', cost: number): ShippingCostOption {
  return { code: 'jne', name: 'JNE', service, description, cost, etd: '5', category, note: '' };
}

const ALL = [
  svc('CTC', 'JNE City Courier', 'REGULAR', 6000),
  svc('CTCSPS', 'JNE City Courier', 'REGULAR', 25000),
  svc('CTCYES', 'JNE City Courier', 'REGULAR', 12000),
  svc('JTR', 'JNE Trucking', 'CARGO', 50000),
  svc('JTR<130', 'JNE Trucking', 'CARGO', 400000),
  svc('JTR>130', 'JNE Trucking', 'CARGO', 600000),
  svc('JTR>200', 'JNE Trucking', 'CARGO', 800000),
];

function eligibleCodes(service: ShippingEligibilityService, kg: number): string[] {
  return service.filterEligibleServices(ALL, kg * 1000).eligible.map((o) => o.service);
}

describe('ShippingEligibilityService', () => {
  const service = new ShippingEligibilityService({ get: () => undefined } as any);

  it('1 kg → paket reguler tetap, semua band JTR tidak eligible', () => {
    const codes = eligibleCodes(service, 1);
    expect(codes).toContain('CTC');
    expect(codes).toContain('CTCSPS');
    expect(codes).toContain('CTCYES');
    expect(codes).not.toContain('JTR');
    expect(codes).not.toContain('JTR<130');
    expect(codes).not.toContain('JTR>130');
    expect(codes).not.toContain('JTR>200');
  });

  it('10 kg → cargo dievaluasi, masih di bawah minimum trucking', () => {
    const codes = eligibleCodes(service, 10);
    expect(codes).toEqual(['CTC', 'CTCSPS', 'CTCYES']);
  });

  it('100 kg → JTR dasar + band <130 eligible', () => {
    const codes = eligibleCodes(service, 100);
    expect(codes).toContain('JTR');
    expect(codes).toContain('JTR<130');
    expect(codes).not.toContain('JTR>130');
    expect(codes).not.toContain('JTR>200');
  });

  it('150 kg → band >130 eligible, <130 tidak', () => {
    const codes = eligibleCodes(service, 150);
    expect(codes).toContain('JTR>130');
    expect(codes).not.toContain('JTR<130');
    expect(codes).not.toContain('JTR>200');
  });

  it('250 kg → band >200 eligible', () => {
    const codes = eligibleCodes(service, 250);
    expect(codes).toContain('JTR>200');
  });

  it('band mati via env → service dikeluarkan', () => {
    const disabled = new ShippingEligibilityService({
      get: (k: string) => (k === 'JTR_GT_130_ENABLED' ? 'false' : undefined),
    } as any);
    const codes = eligibleCodes(disabled, 150);
    expect(codes).not.toContain('JTR>130');
    expect(codes).toContain('CTC');
  });
});