// server/routers/e_router.js 파일

// 메뉴판을 만드는 도구 (Express Router)
const express = require('express');
const router = express.Router();

// 👈 2단계에서 만든 요리사 파일 (서비스 파일)을 가져와요. (경로가 맞는지 꼭 확인)
const workInstService = require('../services/Production/workInst.js'); //

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
module.exports = router;