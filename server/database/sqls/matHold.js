const getHoldList = `
SELECT 
  h.material_code,
  m.material_name,
  h.lot_code,
  CASE 
    WHEN m.material_type = '0l1l' THEN '원자재'
    WHEN m.material_type = '0l2l' THEN '부자재'
    WHEN m.material_type = '0l3l' THEN '소모품'
    ELSE '기타'
  END AS material_type,
  h.hold_qty,
  h.release_qty,
  m.unit,
  mi.inbound_date,
  CASE 
    WHEN h.use_yn = '0b1b' THEN '사용 완료'
    WHEN h.use_yn = '0b2b' THEN '사용 중'
    ELSE '기타'
  END AS use_yn
FROM t_hold h
LEFT JOIN t_material m ON h.material_code = m.material_code
LEFT JOIN t_material_inbound mi ON h.lot_code = mi.lot
`;

const deleteHoldMat = `
  DELETE FROM t_hold
  WHERE hold_id IN (?) -- IN 절을 사용하여 여러 ID를 한 번에 삭제
`;

module.exports = {
  getHoldList,
  deleteHoldMat,
}
