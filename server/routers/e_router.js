// server/routers/e_router.js 파일

// 메뉴판을 만드는 도구 (Express Router)
const express = require('express');
const router = express.Router();

// 👈 2단계에서 만든 요리사 파일 (서비스 파일)을 가져와요. (경로가 맞는지 꼭 확인)
const productionService = require('../services/Production/workInst'); //

// ... (여기에 다른 메뉴들이 이미 적혀 있을 수 있어요.) ...

// '생산계획 목록 주세요!' 라는 주문을 받는 메뉴
// (손님이 '/api/production-plans' 또는 '/api/e/production-plans' 라고 말하면 이 메뉴가 선택돼요)
router.get('/production-plans', async (req, res) => {
    try {
        // (나중에 검색 조건이 필요하면 req.query를 여기서 요리사에게 전달할 수 있어요.)
        const queryParams = req.query;

        // 요리사에게 "생산계획 목록" 요리 좀 해달라고 부탁해요.
        const productionPlans = await productionService.getProductionPlans(queryParams);

        // 요리된 음식을 손님에게 예쁜 그릇(JSON)에 담아 전달해요. (success: true는 잘 됐다는 표시)
        res.json({
            success: true,
            data: productionPlans // 요리된 생산계획 데이터예요.
        });
    } catch (error) {
        // 요리사가 "요리 망쳤어요!" 하고 알려주면, 손님에게 "죄송해요, 서버에 문제 있어요."라고 알려줘요.
        console.error('생산계획 메뉴 준비 중 문제가 발생했어요:', error);
        res.status(500).json({ // 500은 서버 문제라는 코드예요.
            success: false,
            message: '생산계획 조회 중 서버 오류가 발생했습니다.',
            error: error.message
        });
    }
});


module.exports = router;