const searchLotHistory = `
  SELECT
    pr.release_code,
    prd.release_detail_code,
    prd.lot,
    pc.inbound_check_code,
    ip.work_perf_code,
    oor.outsou_inbound_code,
    oo.outsou_order_code,
    wp.work_process_code,
    wi.work_inst_code,
    h.material_code,
    m.material_name,
    h.lot_code
  FROM t_product_release pr
  JOIN t_product_release_detail prd ON pr.release_code = prd.release_code
  JOIN t_prod_receive prcv ON prd.lot = prcv.lot
  JOIN t_product_check pc ON prcv.inbound_check_code = pc.inbound_check_code
  JOIN t_inst_perf ip ON pc.work_perf_code = ip.work_perf_code
  JOIN t_work_inst wi ON ip.work_inst_code = wi.work_inst_code
  JOIN t_work_process wp ON wi.work_inst_code = wp.work_inst_code
  JOIN t_outsou_order oo ON wp.work_process_code = oo.work_process_code
  JOIN t_outsou_receive oor ON oo.outsou_order_code = oor.outsou_order_code
  JOIN t_hold h ON wi.work_inst_code = h.work_inst_code
  LEFT JOIN t_material m ON h.material_code = m.material_code
  WHERE 1 = 1
    /**조건절**/
  ORDER BY pr.release_code DESC`;

module.exports={
  searchLotHistory
}