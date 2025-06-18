// server/routers/e_router.js 파일

// 메뉴판을 만드는 도구 (Express Router)
const express = require('express');
const router = express.Router();

// 👈 2단계에서 만든 요리사 파일 (서비스 파일)을 가져와요. (경로가 맞는지 꼭 확인)
const workInstService = require('../services/Production/workInst.js'); //
const ProductionService= require('../services/Production/PrdWorkingService.js');
// ... (여기에 다른 메뉴들이 이미 적혀 있을 수 있어요.) ...

// 생산계획 목록 

router.get('/production-plans', async (req, res) => {
    try {
    
        const plans = await workInstService.getProductionPlans(); // DB 쿼리 결과 (빈 배열일 수 있음)

        res.json({
            success: true,
            message: plans.length > 0 ? '생산계획 목록 조회 성공' : '조회된 생산계획 데이터가 없습니다.',
            data: plans // <-- 빈 배열이라도 여기에 담아 보냅니다.
        });

    } catch (error) {
        console.error('생산계획 목록 API 오류:', error);
        res.status(500).json({
            success: false,
            message: '생산계획 목록을 불러오는 중 서버 오류 발생',
            error: error.message
        });
    }
});
//작업지시 저장
router.post('/workInstMngment/save',async(req,res)=>{

    try{

        console.log('--- Start Request Body Log for /workInstMngment/save ---');
        console.log('Full req.body:', JSON.stringify(req.body, null, 2)); // req.body 전체를 JSON 형태로 예쁘게 출력
        console.log('Type of req.body:', typeof req.body);
        console.log('Is req.body an array?', Array.isArray(req.body));
        console.log('Value of req.body.workInstructions:', req.body.workInstructions); // 추출하려는 workInstructions 값 확인
        console.log('Type of req.body.workInstructions:', typeof req.body.workInstructions);
        console.log('Is req.body.workInstructions an array?', Array.isArray(req.body.workInstructions));
        console.log('--- End Request Body Log ---');
        const workInstructions = req.body;
        const result = await workInstService.saveWorkInstructions(workInstructions);
        res.json({
            success:true,
            message:'작업지시가 성공적으로 자장!',
            data:result
        });

    }catch(error){
                // 오류가 발생하면 클라이언트에게 실패 응답을 보냅니다.
        console.error('작업지시 저장 중 문제가 발생했어요:', error);
        res.status(500).json({
            success: false,
            message: '작업지시 저장 중 서버 오류가 발생했습니다.',
            error: error.message // 디버깅을 위해 실제 에러 메시지를 포함시키는 것이 좋습니다.
        });
    }
})
//작업지시 조회
router.get('/allworkInst',async(req,res)=>{
    try{
        const allworkInsts = await workInstService.getWorkInstAll();
           res.json({
            success: true,
            message: allworkInsts.length > 0 ? '생산계획 목록 조회 성공' : '조회된 생산계획 데이터가 없습니다.',
            data: allworkInsts // <-- 빈 배열이라도 여기에 담아 보냅니다.
        });
    }catch(error){
         console.error('작업지시  목록 API 오류:', error);
        res.status(500).json({
            success: false,
            message: '작업지시 목록을 불러오는 중 서버 오류 발생',
            error: error.message
        });
    }
})

// 작업지시 삭제
router.post('/workInstMngment/delete', async (req, res) => {
    try {
        const { workInstCodes } = req.body; // 프론트에서 보낸 workInstCodes 배열을 받음

        // 유효성 검사 (프론트에서 1차로 하지만, 백엔드에서도 반드시 검증해야 함)
        if (!workInstCodes || !Array.isArray(workInstCodes) || workInstCodes.length === 0) {
            return res.status(400).json({ success: false, message: "삭제할 작업지시 코드가 제공되지 않았습니다." });
        }

        console.log(`Deleting work instructions with codes: ${workInstCodes.join(', ')}`);
        const result = await workInstService.deleteWorkInstructions(workInstCodes);

        res.json(result); // workInstService에서 반환하는 { success: boolean, message: string, ... } 객체를 그대로 전달
    } catch (error) {
        console.error('작업지시 삭제 API 오류:', error);
        // 서비스 함수에서 이미 구체적인 메시지를 반환하도록 되어 있다면, 그대로 사용하거나 추가 메시지
        res.status(500).json({
            success: false,
            message: `작업지시 삭제 중 서버 오류 발생: ${error.message}`
        });
    }
});

// 공정 흐름도 가져오는 라우터
// 공정 흐름도 가져오기
router.get('/workInst/:workInstCode/processes', async (req, res) => {
    const { workInstCode } = req.params;
    console.log('Received workInstCode in router:', workInstCode);
    try {
        const data = await ProductionService.getProcessFlowByWorkInst(workInstCode);
        if (data.length > 0) {
            res.json({ success: true, data });
        } else {
            res.status(404).json({ success: false, message: '해당 작업지시에 대한 공정 흐름도를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error(`Error fetching processes for workInst ${workInstCode}:`, error);
        res.status(500).json({ success: false, message: '공정 흐름도를 불러오는 데 실패했습니다.', error: error.message });
    }
});

router.get('/processes/:processCode/equipment', async (req, res) => {
    const { processCode } = req.params;
    console.log('Received processCode in router for equipment:', processCode);
    try {
        // ⭐ 수정: ProductionService 객체를 통해 getEquipmentByProcess 호출 ⭐
        const data = await ProductionService.getEquipmentByProcess(processCode);
        if (data.length > 0) {
            res.json({ success: true, data });
        } else {
            res.status(404).json({ success: false, message: '해당 공정에 연결된 설비를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error(`Error fetching equipment for process ${processCode}:`, error);
        res.status(500).json({ success: false, message: '설비 목록을 불러오는 데 실패했습니다.', error: error.message });
    }
});

router.get('/getWorkInstDetails', async (req, res) => {
    const { work_inst_code } = req.query; // GET 요청의 쿼리 파라미터는 req.query로 받습니다.
    console.log('Received work_inst_code for details:', work_inst_code);
    try {
        // workInstService에서 getWorkInstDetails를 호출해야 합니다.
        // ProductionService는 공정 관련 서비스이므로 workInst.js의 서비스 함수를 사용해야 합니다.
        const data = await ProductionService.getWorkInstDetails(work_inst_code);
        if (data) { // getWorkInstDetails는 단일 객체 또는 null을 반환합니다.
            res.json({ success: true, data });
        } else {
            res.status(404).json({ success: false, message: '해당 작업지시 상세 정보를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error(`Error fetching workInst details for ${work_inst_code}:`, error);
        res.status(500).json({ success: false, message: '작업지시 상세 정보를 불러오는 데 실패했습니다.', error: error.message });
    }
});
router.post('/startWork', async (req, res) => {
    const { work_inst_code, process_code, equi_code, start_date, user_code } = req.body; // 프론트에서 보낸 payload

    console.log(`[Router] 작업 시작 요청 수신: 작업지시=${work_inst_code}, 공정=${process_code}, 설비=${equi_code}, 시작시간=${start_date}, 사용자=${user_code}`);

    try {
        // ProductionService의 startWorkProcess 함수를 호출합니다.
        const result = await ProductionService.startWorkProcess(
            work_inst_code,
            process_code,
            equi_code,
            start_date, // 서비스 함수에서 NOW()를 쓴다면 이 파라미터는 서비스 내부에서 사용되지 않습니다.
            user_code   // 서비스 함수에서 work_start_worker_code를 업데이트한다면 이 파라미터가 필요합니다.
        );

        if (result.success) {
            res.json({
                success: true,
                message: result.message || '작업이 성공적으로 시작되었습니다.',
                data: result.data // 서비스에서 반환하는 추가 데이터가 있다면 포함
            });
        } else {
            // 서비스에서 실패 응답을 직접 처리하는 경우도 있으므로, 여기서는 기본 실패 메시지 제공
            res.status(400).json({
                success: false,
                message: result.message || '작업 시작에 실패했습니다.',
                error: result.error || '알 수 없는 오류'
            });
        }
    } catch (error) {
        console.error(`[Router] 작업 시작 중 서버 오류 발생:`, error);
        res.status(500).json({
            success: false,
            message: '작업 시작 중 서버 내부 오류가 발생했습니다.',
            error: error.message
        });
    }
});

router.post('/endWork', async (req, res) => {
    // 프론트엔드에서 work_inst_code, process_code만 보낼 것으로 가정
    const { work_inst_code, process_code } = req.body;

    try {
        const result = await ProductionService.endWorkProcess(
            work_inst_code,
            process_code
        );
        res.status(200).json(result);
    } catch (error) {
        console.error('API /endWork 오류:', error);
        res.status(500).json({ success: false, message: error.message || '서버 오류 발생' });
    }
});

router.post('/prdPref', async (req, res) => {
    const { work_inst_code, prod_code, work_process_code,input_qty, prod_qty,defect_qty, pref_note,defect_type, emp_num} = req.body;
    try {
        // details 객체를 생성하여 전달
        const details = {
            work_inst_code,
            prod_code,
            work_process_code,
            input_qty,
            prod_qty,
            defect_qty,
            pref_note,
            defect_type,
            emp_num
        };

        // 디버깅을 위해 전달되는 details 객체 로그 출력 (배포 시에는 제거)
        console.log('[Router] Sending details to service:', details);

        const result = await ProductionService.insertPrdPref(details);
        res.send(result);
    } catch (error) {
        console.error('Error in /prdPref route:', error); // 에러 로그 추가
        res.status(500).json({ success: false, message: '작업실적 등록 실패', error: error.message }); // 에러 응답 추가
    }
});

module.exports = router;