process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../index';

export function runQaTests(): Promise<{ passed: number; failed: number }> {
  return new Promise((resolve) => {
    let passed = 0;
    let failed = 0;
    let token = '';

    const server = http.createServer(app);
    const PORT = 5098;

    function assert(condition: boolean, message: string) {
      if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
      }
    }

    server.listen(PORT, async () => {
      console.log(`\n🧪 Starting GarmentERP BD Phase 5 (Core QA/QC: 4-Point, Inline, Rework, CAPA & AQL 2.5) Tests...\n`);

      try {
        // Helper
        const request = async (method: string, path: string, body?: any, reqToken?: string): Promise<{ status: number; data: any }> => {
          const res = await fetch(`http://localhost:${PORT}${path}`, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...(reqToken || token ? { Authorization: `Bearer ${reqToken || token}` } : {})
            },
            body: body ? JSON.stringify(body) : undefined
          });
          const json: any = await res.json().catch(() => ({}));
          return { status: res.status, data: json };
        };

        // 1. Auth Super Admin
        const authRes = await request('POST', '/api/v1/auth/login', {
          email: 'admin@garmenterp.com',
          password: 'Admin123!'
        });
        assert(authRes.status === 200 && authRes.data.success, 'Super Admin Authentication & JWT Generation');
        token = authRes.data.data.accessToken;

        // 2. Fabric 4-Point: Get seeded inspections
        const f4pListRes = await request('GET', '/api/v1/qa/fabric-4point');
        assert(
          f4pListRes.status === 200 && 
          f4pListRes.data.data.length >= 3 &&
          f4pListRes.data.data.some((f: any) => f.penaltyGrade === 'FIRST_QUALITY_PASS') &&
          f4pListRes.data.data.some((f: any) => f.penaltyGrade === 'REJECTED'),
          'Retrieve Fabric 4-Point Inspection catalog with PASS and REJECT rolls'
        );

        // 3. Fabric 4-Point: Calculate & Record First Quality Roll
        // 120 yards, 60 in width, 4 defect pts -> (4 * 3600) / (120 * 60) = 2.0 pts/100 sq yds
        const newRollPass = await request('POST', '/api/v1/qa/fabric-4point', {
          rollNumber: `ROL-TEST-${Date.now().toString().slice(-4)}`,
          fabricLot: 'LOT-TEST-PASS',
          fabricType: '100% Cotton Single Jersey 160 GSM',
          inspectedLengthYards: 120,
          fabricWidthInches: 60,
          defectsSize1Count: 2,
          defectsSize2Count: 1,
          defectsSize3Count: 0,
          defectsSize4Count: 0,
          comments: 'Even yarn surface, zero shading.'
        });
        assert(
          newRollPass.status === 201 &&
          newRollPass.data.data.pointsPer100SqYards === 2.0 &&
          newRollPass.data.data.penaltyGrade === 'FIRST_QUALITY_PASS',
          'Fabric 4-Point Engine correctly computes Points per 100 Sq Yds (2.0 pts) and awards FIRST_QUALITY_PASS'
        );

        // 4. Fabric 4-Point: Calculate & Record Reject Roll (> 28 pts)
        // 100 yards, 50 in width, 50 defect pts -> (50 * 3600) / (100 * 50) = 36.0 pts/100 sq yds
        const newRollFail = await request('POST', '/api/v1/qa/fabric-4point', {
          rollNumber: `ROL-TEST-FAIL-${Date.now().toString().slice(-4)}`,
          fabricLot: 'LOT-TEST-REJ',
          fabricType: 'Spandex Interlock 220 GSM',
          inspectedLengthYards: 100,
          fabricWidthInches: 50,
          defectsSize1Count: 5,
          defectsSize2Count: 5,
          defectsSize3Count: 5,
          defectsSize4Count: 5, // (5*1)+(5*2)+(5*3)+(5*4) = 5+10+15+20 = 50 pts
          comments: 'Excessive slubs and drop stitches throughout entire roll.'
        });
        assert(
          newRollFail.status === 201 &&
          newRollFail.data.data.pointsPer100SqYards === 36.0 &&
          newRollFail.data.data.penaltyGrade === 'REJECTED',
          'Fabric 4-Point Engine enforces Strict Quality Gate: flags penalty >28 pts (36.0 pts) as REJECTED'
        );

        // 5. Sewing Defects: Query defects
        const defectsList = await request('GET', '/api/v1/qa/inspections');
        assert(
          defectsList.status === 200 && defectsList.data.data.length >= 4,
          'Retrieve Inline & End-line Sewing Defect Matrix across Lines 01 to 04'
        );

        // 6. Sewing Defects: Log Major Defect and verify Rework Order auto-generation
        const logDefectRes = await request('POST', '/api/v1/qa/inspections', {
          inspectionType: 'INLINE',
          lineId: 'line-sew-01',
          lineNumber: 'Sewing Line 01 (Polo Shirt Specialist)',
          styleNumber: 'TSH-2026-001',
          poNumber: 'PO-2026-001',
          defectCode: 'DEF-OP-05',
          defectName: 'Open Seam along Armhole Join',
          severity: 'MAJOR',
          zone: 'ARMHOLE',
          operatorStation: 'Station 10 (Armhole Overlock)',
          inspectedGarments: 200,
          defectQty: 5
        });
        assert(
          logDefectRes.status === 201 &&
          logDefectRes.data.data.dhuPercent === 2.5 &&
          logDefectRes.data.data.status === 'REWORK_ISSUED',
          'Log Sewing Defect computes DHU (2.5%) and auto-transitions status to REWORK_ISSUED for Major Severity'
        );

        // 7. Rework Orders: Verify auto-generated quarantine order
        const reworkList = await request('GET', '/api/v1/qa/rework-orders');
        const createdRework = reworkList.data.data.find((r: any) => r.defectId === logDefectRes.data.data.id);
        assert(
          reworkList.status === 200 &&
          createdRework !== undefined &&
          createdRework.quarantineQty === 5 &&
          createdRework.status === 'PENDING_REWORK',
          'Automatic Rework Order Quarantine Workflow created with 5 quarantine pieces in PENDING_REWORK'
        );

        // 8. Rework Orders: Complete repair and re-inspect pass
        const updateRwkRes = await request('PUT', `/api/v1/qa/rework-orders/${createdRework.id}/status`, {
          status: 'RE_INSPECTED_PASS',
          repairedQty: 5,
          scrappedQty: 0
        });
        assert(
          updateRwkRes.status === 200 &&
          updateRwkRes.data.data.status === 'RE_INSPECTED_PASS' &&
          updateRwkRes.data.data.repairedQty === 5,
          'Rework Order Repair Station complete & Certified as RE_INSPECTED_PASS, closing defect loop'
        );

        // 9. CAPA 5-Whys: Get Records
        const capaList = await request('GET', '/api/v1/qa/capa');
        assert(
          capaList.status === 200 && capaList.data.data.length >= 1,
          'Retrieve CAPA Root-Cause Analysis Registry'
        );

        // 10. CAPA 5-Whys: Create structured investigation
        const newCapaRes = await request('POST', '/api/v1/qa/capa', {
          title: 'Oil Stain Contamination from Overlock Sewing Machine Head',
          issueDescription: 'White pique polo shirts displayed dark lubricant stains along bottom hem.',
          lineId: 'line-sew-02',
          lineNumber: 'Sewing Line 02 (Graphic Tees High-Speed)',
          defectType: 'Machine Oil Contamination',
          why1: 'Needle bar shaft leaked synthetic oil onto moving fabric panel.',
          why2: 'Needle bar oil seal gasket was deteriorated and split.',
          why3: 'Quarterly preventive maintenance gasket replacement was overdue by 3 weeks.',
          why4: 'Maintenance logbook was kept manually and lacked automatic digital calibration reminders.',
          why5RootCause: 'Absence of ERP automated maintenance scheduling engine with line supervisor alert threshold.',
          category: 'MACHINE',
          correctiveAction: 'Replaced oil gasket, flushed sump, and dry-cleaned affected 18 garment panels with approved spot-cleaner.',
          preventiveAction: 'Configured automated weekly maintenance checklist in GarmentERP BD maintenance module.',
          assignedTo: 'Engr. Naimur Rahman (QA Head)',
          targetClosureDate: '2026-07-20'
        });
        assert(
          newCapaRes.status === 201 &&
          newCapaRes.data.data.status === 'UNDER_REVIEW' &&
          newCapaRes.data.data.category === 'MACHINE',
          'Create CAPA 5-Whys Root Cause Analysis with systematic 5-level causality breakdown'
        );

        // 11. CAPA: QA Manager verification gate
        const verifyCapaRes = await request('PUT', `/api/v1/qa/capa/${newCapaRes.data.data.id}/verify`, {
          signature: 'FA-LEAD-AUDIT-SIGN-2026'
        });
        assert(
          verifyCapaRes.status === 200 &&
          verifyCapaRes.data.data.status === 'APPROVED_ACTIVE' &&
          verifyCapaRes.data.data.qaManagerApproval?.approvedBy !== undefined,
          'QA Manager Approval Gate certifies & authorizes active CAPA preventive barrier'
        );

        // 12. ISO 2859-1 / AQL 2.5 Sampling: Calculate and cert pass
        // Lot 5000 pcs, Level II -> Sample Code K -> Sample Size 315, Ac 14, Re 15
        const aqlRes = await request('POST', '/api/v1/qa/aql/calculate', {
          poNumber: 'PO-2026-001',
          buyerPo: 'HM-PO-99201',
          buyerName: 'H&M Hennes & Mauritz GBC AB',
          styleNumber: 'TSH-2026-001',
          totalLotSize: 5000,
          generalInspectionLevel: 'LEVEL_II',
          criticalDefectsFound: 0,
          majorDefectsFound: 4, // well under 14
          minorDefectsFound: 8  // well under 21
        });
        assert(
          aqlRes.status === 201 &&
          aqlRes.data.data.sampleSizeCodeLetter === 'K' &&
          aqlRes.data.data.sampleSize === 315 &&
          aqlRes.data.data.majorAc === 14 &&
          aqlRes.data.data.overallResult === 'ACCEPTED_PASS',
          'ISO 2859-1 Level II Normal Sampling accurately calculates Sample Size (315 pcs), Ac 14/Re 15, and issues ACCEPTED_PASS Certificate'
        );

      } catch (err: any) {
        console.error('Test Execution Error:', err);
        failed++;
      } finally {
        server.close(() => {
          console.log(`\n========================================`);
          console.log(`Phase 5 Test Results: ${passed} Passed, ${failed} Failed`);
          console.log(`========================================\n`);
          resolve({ passed, failed });
        });
      }
    });
  });
}

if (require.main === module) {
  runQaTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
