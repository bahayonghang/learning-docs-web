import type { Locale } from '../types';
import { forecastDay, rollingBacktest, mae, empiricalQuantile, pinballLoss, hedgeCosts, storageCycle, type BatteryConfig } from './math';
import { createLab, range, select, simpleActions, actions, staticLab, panel, equation, note, metric, svg, fmt, player, setValues, table, lineChart, bars } from './shared';

export function forecastLab(host:HTMLElement,locale:Locale){
  const t=(zh:string,en:string)=>locale==='zh'?zh:en;
  const ctx=createLab(host,locale,{
    intro:t('同一组确定性的 24 小时合成数据，让你对照温度模型、固定日曲线和模拟实际负荷。模型越复杂不代表误差必然越小。','Use the same deterministic synthetic 24-hour series to compare a temperature model, fixed daily profile, and simulated actual load. More complexity does not guarantee smaller error.'),
    challenge:t('在炎热的一天，固定日曲线是否仍然够用？调整温度敏感度后，哪些误差仍然无法解释？','Does a fixed daily profile still work on a hot day? Which errors remain after adjusting temperature sensitivity?'),
    controls:range('temperature',t('日均温度参数','Daily temperature parameter'),10,36,1,28,' °C')+range('sensitivity',t('模型温度敏感度','Model temperature sensitivity'),0,3,0.1,1,' MW/°C')+range('bias',t('模型负荷偏置','Model load bias'),-15,15,1,0,' MW')+simpleActions(t),
    boundary:t('所有曲线由公开在代码中的确定性函数合成；不是测量值，也不是真实神经网络训练。模拟实际包含额外周期项，模型不能完全解释。天气输入在此视为已知，真实日前业务必须使用当时可获得的天气预报版本。','All curves come from deterministic functions in the source, not measurements or trained neural networks. Simulated actual load includes an extra periodic term the model cannot fully explain. Weather is treated as known here; real day-ahead work requires the forecast vintage available at the decision time.'),
  });
  const draw=()=>{
    const r=forecastDay(ctx.number('temperature'),ctx.number('sensitivity'),ctx.number('bias'));
    ctx.output.innerHTML=panel(t('预测和模拟实际放在一起看','Compare forecasts with simulated actuals'),lineChart(t('24 小时负荷','24-hour load'),[{label:t('模拟实际','Simulated actual'),values:r.actual},{label:t('温度模型','Temperature model'),values:r.predicted},{label:t('固定日曲线基线','Fixed-profile baseline'),values:r.baseline,dashed:true}],'MW',t('小时','Hour')))+`<div class="lab-metrics">${metric(t('温度模型 MAE','Temperature-model MAE'),`${fmt(r.modelMae,2)} MW`)}${metric(t('基线 MAE','Baseline MAE'),`${fmt(r.baselineMae,2)} MW`)}</div>`+panel(t('同一天的合成气温','Synthetic temperature on the same day'),lineChart(t('气温输入','Temperature input'),[{label:t('气温','Temperature'),values:r.temperature}],'°C',t('小时','Hour')))+equation(`ŷₕ = 70 + b + k × max(Tₕ − 18, 0) + 8 sin((h − 8)π/12)\nb = ${ctx.number('bias')}; k = ${ctx.number('sensitivity')}`)+note(t('先比较同一个基准','Use the same evaluation baseline'),t('两个模型都在这 24 个时点上评估 MAE。只看曲线像不像不够；还需检查高峰误差、不同天气与真实业务时点的信息可用性。','Both models use MAE on these same 24 timestamps. Visual similarity alone is insufficient: inspect peak errors, different weather, and information available at the actual decision time.'));
  };
  return staticLab(ctx,draw,{temperature:34,sensitivity:1.4,bias:0});
}

export function backtestLab(host:HTMLElement,locale:Locale){
  const t=(zh:string,en:string)=>locale==='zh'?zh:en;
  const ctx=createLab(host,locale,{
    intro:t('前 24 小时是起始训练窗。随后每到一个时点，先拟合、预测，再揭示真实值；正确流程只使用此前观测。','The first 24 hours form the initial training window. At each later origin, fit, predict, then reveal the observation. The valid process uses only earlier observations.'),
    challenge:t('第 30 小时负荷突然上移。偷看未来的模型为何看起来适应更快？它能在真实决策时得到相同的信息吗？','Load shifts upward at hour 30. Why might a model that sees the future appear to adapt faster? Would it have the same information at a real decision time?'),
    controls:select('mode',t('训练信息范围','Training information'),[{value:'rolling',label:t('仅过去：滚动起点','Past only: rolling origin')},{value:'leaky',label:t('错误演示：偷看全部未来','Invalid demo: see all future data')}],'rolling')+range('shift',t('第 30 小时水平变化','Level change at hour 30'),0,25,1,12,' MW')+actions(t)+`<div class="lab-actions"><button data-action="preset" type="button">${t('演示未来信息泄露','Demonstrate future leakage')}</button></div>`,
    boundary:t('48 个确定性合成时点，一元线性趋势模型，每次只预测下一时点。真实多步回测必须按预测期限、发布日期和目标时点重新构造训练集。泄露模式是反面示例，结果不可当作可部署表现。','48 deterministic synthetic timestamps, one linear trend, and one-step forecasts. Real multi-horizon backtests must rebuild training sets using horizon, publication time, and target time. Leaky mode is an invalid counterexample and cannot represent deployable performance.'),
  });
  let revealed=1;
  const draw=()=>{
    const leaky=ctx.value('mode')==='leaky',r=rollingBacktest(ctx.number('shift'),leaky),count=Math.max(1,revealed);
    const predicted=r.actual.map((_,i)=>i>=24&&i<24+revealed?r.predictions[i-24]:null);
    const shownActual=r.actual.map((v,i)=>i<24+revealed?v:null);
    const error=mae(r.actual.slice(24,24+count),r.predictions.slice(0,count));
    ctx.output.innerHTML=panel(t('训练窗与逐步揭示的测试窗','Training window and progressively revealed test window'),lineChart(t('滚动回测曲线','Rolling backtest'),[{label:t('已揭示观测','Revealed observations'),values:shownActual},{label:t('当时的预测','Forecast at each origin'),values:predicted}], 'MW',t('时间索引（虚线后开始测试）','Time index (test starts after dashed line)'),23.5))+`<div class="lab-state"><span>${t('已评估测试点','Test origins evaluated')} <strong data-iteration>${revealed} / 24</strong></span><span>${leaky?t('训练看见 0–47','Training sees 0–47'):t(`最后一次训练只看 0–${22+revealed}`,`Last fit sees only 0–${22+revealed}`)}</span></div><div class="lab-metrics">${metric(t('当前训练 MAE','Current training MAE'),`${fmt(r.trainErrors[count-1],2)} MW`)}${metric(t('已揭示测试 MAE','Revealed test MAE'),`${fmt(error,2)} MW`)}</div>`+table([t('目标时点','Target time'),t('预测 MW','Forecast MW'),t('实际 MW','Actual MW'),t('绝对误差 MW','Absolute error MW')],r.predictions.slice(Math.max(0,revealed-5),revealed).map((p,j)=>{const i=Math.max(0,revealed-5)+j;return [24+i,fmt(p,2),fmt(r.actual[24+i],2),fmt(Math.abs(p-r.actual[24+i]),2)];}),t('显示最近最多 5 个已评估时点。两种模式使用同一测试区间；训练数据范围不同。','Showing up to the five latest evaluated timestamps. Both modes use the same test interval but different training-information sets.'))+(leaky?`<div class="lab-warning" role="status">${t('此模式把测试目标用于拟合，违反信息时序。即使误差更低，也不是有效回测；泄露并不保证所有样本的误差都更小。','This mode fits on test targets and violates information timing. A lower error would still be invalid; leakage does not guarantee improvement on every sample.')}</div>`:note(t('按顺序执行','Respect the order'),t('预测 t 时，只使用索引小于 t 的观测。参数重估同样发生在每一个历史预测起点。','At origin t, only observations with index below t are used. Parameters are re-estimated at every historical forecast origin.')));
  };
  const step=()=>{if(revealed>=24)return false;revealed++;draw();return revealed<24;};const playback=player(ctx,step,550);
  ctx.onInput(()=>{playback.stop();revealed=1;draw();});
  ctx.onAction(a=>{if(a==='play')playback.toggle();else if(a==='step'){playback.stop();step();}else if(a==='reset'||a==='preset'){playback.stop();setValues(ctx,a==='preset'?{mode:'leaky',shift:20}:{mode:'rolling',shift:12});revealed=1;draw();}});
  draw();return ctx.cleanup;
}

const priceSample=[220,260,290,300,320,340,380,440,520,900];
export function quantilesLab(host:HTMLElement,locale:Locale){
  const t=(zh:string,en:string)=>locale==='zh'?zh:en;
  const ctx=createLab(host,locale,{
    intro:t('十个价格样本中有一个尖峰。分位数不是把每个样本平均，而是改变高估与低估的代价，找到 pinball loss 的最小值。','One of ten price samples is a spike. A quantile changes the relative cost of over- and underprediction to minimize pinball loss, instead of averaging observations.'),
    challenge:t('从 0.5 分位数改成 0.9。低估价格的惩罚与合适的预测值分别会怎样变化？','Move from the 0.5 to the 0.9 quantile. What happens to the penalty for underprediction and to a suitable prediction?'),
    controls:range('quantile',t('目标分位数 q','Target quantile q'),0.1,0.9,0.05,0.8)+range('prediction',t('你给出的价格预测','Your price prediction'),100,1100,10,400,' CNY/MWh')+simpleActions(t),
    boundary:t('固定十个人工样本的经验分位数，不是条件概率模型，也不保证未来覆盖率。样本量有限，最优解可能是一个区间；这里给出左侧经验分位数作为一个最小化解。','An empirical quantile of ten fixed illustrative samples, not a conditional probability model or a guarantee of future coverage. Finite-sample minimizers may form an interval; the left empirical quantile is shown as one minimizer.'),
  });
  const draw=()=>{
    const q=ctx.number('quantile'),p=ctx.number('prediction'),best=empiricalQuantile(priceSample,q),loss=pinballLoss(priceSample,p,q),bestLoss=pinballLoss(priceSample,best,q);
    const grid=Array.from({length:51},(_,i)=>100+i*20),losses=grid.map(x=>pinballLoss(priceSample,x,q)),max=Math.max(...losses)*1.12,xx=(x:number)=>60+(x-100)/1000*430,yy=(y:number)=>225-y/max*180;
    const content=`<path d="M60 30V225H490" class="lab-grid"/><path d="${grid.map((x,i)=>`${i?'L':'M'}${xx(x)},${yy(losses[i])}`).join(' ')}" class="lab-curve"/><circle cx="${xx(p)}" cy="${yy(loss)}" r="6" class="lab-trail"/><line x1="${xx(best)}" x2="${xx(best)}" y1="35" y2="225" stroke="var(--lab-teal)" stroke-dasharray="5 5"/><text x="60" y="18" class="lab-svg-small">${t('平均 pinball loss','Mean pinball loss')} (CNY/MWh)</text><text x="60" y="247" class="lab-svg-small">100</text><text x="490" y="247" text-anchor="end" class="lab-svg-small">1100</text><text x="275" y="271" text-anchor="middle" class="lab-svg-small">${t('预测价格','Predicted price')} (CNY/MWh)</text>`;
    ctx.output.innerHTML=panel(t('移动预测，寻找不对称损失的低点','Move the forecast to minimize asymmetric loss'),svg(t('Pinball 损失曲线','Pinball loss curve'),content,520,290),t('橙线是每个候选价格的平均损失；圆点是当前预测；虚线是一个最小化解。','Orange shows average loss at candidate prices; the dot is your forecast; the dashed line marks one minimizer.'))+`<div class="lab-metrics">${metric(t('当前 pinball loss','Current pinball loss'),`${fmt(loss,2)} CNY/MWh`)}${metric(t('一个经验分位数解','One empirical quantile minimizer'),`${best} CNY/MWh`,`${t('最小损失','Minimum loss')}: ${fmt(bestLoss,2)}`)}</div>`+equation(`e = y − ŷ; ρq(e) = e ≥ 0 ? q·e : (q−1)·e\nq = ${q}; ŷ = ${p}; ${t('样本','Sample')} = [${priceSample.join(', ')}]`)+note(t('覆盖率不是置信度','Coverage is not confidence'),t(`当前预测覆盖 ${priceSample.filter(x=>x<=p).length}/10 个样本。这个经验比例不等于“未来有同样概率不会超价”；还需独立的时序校准。`,`The current prediction covers ${priceSample.filter(x=>x<=p).length}/10 sample values. This empirical fraction is not a guarantee of the same future coverage; independent temporal calibration is required.`));
  };
  return staticLab(ctx,draw,{quantile:0.9,prediction:520});
}

export function hedgeLab(host:HTMLElement,locale:Locale){
  const t=(zh:string,en:string)=>locale==='zh'?zh:en;
  const ctx=createLab(host,locale,{
    intro:t('售电方给定一段确定用电量，先按固定价锁定一部分，其余在现货采购。比较三种价格场景下的购电成本。','A retailer must procure a fixed energy quantity. Lock a share at a contract price and buy the rest on spot, then compare costs across three scenarios.'),
    challenge:t('锁定比例提高，会同时降低期望成本和最坏尾部成本吗？把合约价调高再比较。','Does a larger hedge lower both expected cost and worst-tail cost? Raise the contract price and compare again.'),
    controls:range('load',t('确定需求','Fixed demand'),10,200,10,100,' MWh')+range('hedge',t('锁定比例 h','Locked fraction h'),0,1,0.05,0.6)+range('contract',t('锁定价格','Contract price'),200,700,10,380,' CNY/MWh')+range('spike',t('尖峰场景现货价','Spike spot price'),600,2000,50,950,' CNY/MWh')+range('alpha',t('CVaR 置信水平 α','CVaR level α'),0.5,0.95,0.05,0.8)+simpleActions(t),
    boundary:t('三场景、固定需求、价格接受者的采购例子；概率固定为 0.25、0.50、0.25。合约视为同一时段可对冲的电能锁定，不建模市场的交割与差价条款。忽略负荷误差、保证金、流动性、费用及零售收入，不等于利润或投资建议。','Three scenarios with fixed demand and a price-taking buyer; probabilities are 0.25, 0.50, and 0.25. The contract is a same-period energy hedge, without jurisdiction-specific delivery or difference-settlement terms. Load errors, collateral, liquidity, fees, and retail revenue are excluded; procurement cost is not profit or investment advice.'),
  });
  const draw=()=>{
    const load=ctx.number('load'),h=ctx.number('hedge'),contract=ctx.number('contract'),alpha=ctx.number('alpha'),prices=[220,420,ctx.number('spike')],r=hedgeCosts(load,h,contract,prices,[.25,.5,.25],alpha);
    ctx.output.innerHTML=panel(t('三个场景的总采购成本','Total procurement cost by scenario'),bars([t('低价 · 25%','Low · 25%'),t('常态 · 50%','Normal · 50%'),t('尖峰 · 25%','Spike · 25%')],r.costs),t('横条单位为元；概率是人工设定的场景权重。','Bars are in CNY; probabilities are assumed scenario weights.'))+`<div class="lab-metrics">${metric(t('期望采购成本','Expected procurement cost'),`${fmt(r.mean)} CNY`)}${metric(`CVaR ${fmt(alpha*100,0)}%`,`${fmt(r.cvar)} CNY`)}${metric(t('成本标准差','Cost standard deviation'),`${fmt(r.sd,2)} CNY`)}</div>`+equation(`Qcontract = ${load} × ${h} = ${fmt(r.locked)} MWh\nCₛ = ${fmt(r.locked)} × ${contract} + ${fmt(r.spot)} × Pₛ`)+note(t('CVaR 在这里指什么','What CVaR means here'),t(`按成本从大到小排列，取最贵 ${fmt((1-alpha)*100,0)}% 概率质量的平均成本；落在边界上的场景只取需要的一部分概率。它与收入损失的 CVaR 不是同一符号方向。`,`Sort costs from highest to lowest and average the worst ${fmt((1-alpha)*100,0)}% probability mass, splitting a boundary scenario if needed. This is an upper cost tail, not the sign convention of a revenue-loss model.`))+note(t('风险和期望需要一起看','Compare risk with expectation'),t('完全锁定使这三个价格场景的采购成本相同，但可能放弃低价机会。现实中需求数量仍有误差，锁价并不消除所有风险。','A full hedge equalizes costs across these price scenarios but can forgo low-price opportunities. Real demand remains uncertain, so locking a price does not eliminate every risk.'));
  };
  return staticLab(ctx,draw,{load:100,hedge:1,contract:600,spike:950,alpha:.8});
}

export function storageLab(host:HTMLElement,locale:Locale){
  const t=(zh:string,en:string)=>locale==='zh'?zh:en;
  const ctx=createLab(host,locale,{
    intro:t('从空电池开始：先充电两个时段，再等待、放电两个时段、等待。逐步核对电网侧电量、储能库存和现金流。','Start with an empty battery: charge for two periods, wait, discharge for two periods, then wait. Reconcile grid energy, stored inventory, and cash flow step by step.'),
    challenge:t('按同样的功率充入和放出，为什么电池会先放空？减少放电功率后，期末还留着的电量能当作已实现收益吗？','Why can the battery empty early when charge and discharge powers match? If discharge power is reduced, can terminal inventory be treated as realized income?'),
    controls:range('capacity',t('能量容量','Energy capacity'),1,8,0.5,4,' MWh')+range('power',t('充电/额定功率','Charging/rated power'),0.5,3,0.25,2,' MW')+range('hours',t('每时段长度','Period duration'),0.25,2,0.25,1,' h')+range('efficiency',t('每方向效率','Efficiency in each direction'),0.7,1,0.01,0.9)+range('discharge',t('放电功率/额定功率','Discharge/rated power'),0.2,1,0.05,1)+range('peak',t('第 5 时段电价','Period-5 price'),200,1400,50,900,' CNY/MWh')+actions(t)+`<div class="lab-actions"><button data-action="preset" type="button">${t('试试期末有剩余电量','Try residual terminal inventory')}</button></div>`,
    boundary:t('固定六时段手工计划，非优化求解。功率以电网侧为准，正数为充电、负数为放电；每时段只选一个方向。SOC 下限为 0、上限为容量，功率自动裁切。未计电池衰减、辅机、交易费用或备用约束。净现金流只有在期末库存回到初值且费用齐全时才可直接比较完整循环。','A fixed six-period manual schedule, not an optimization. Power is measured at the grid: positive charges, negative discharges; one direction per period. SOC lies between zero and capacity, with power clipped to feasibility. Degradation, auxiliary use, fees, and reserve constraints are excluded. Complete cycles are directly comparable only with matched terminal inventory and all relevant costs.'),
  });
  let revealed=0;
  const config=():BatteryConfig=>({capacity:ctx.number('capacity'),maxPower:ctx.number('power'),hours:ctx.number('hours'),chargeEfficiency:ctx.number('efficiency'),dischargeEfficiency:ctx.number('efficiency')});
  const draw=()=>{
    const cfg=config(),r=storageCycle(cfg,ctx.number('power'),ctx.number('discharge'),ctx.number('peak')),shown=r.steps.slice(0,revealed),energy=shown.at(-1)?.energy??0,cash=shown.reduce((s,x)=>s+x.cashflow,0),loss=shown.reduce((s,x)=>s+x.loss,0);
    const completed=revealed===6,balanced=energy<1e-8;
    const states:[number,...(number|null)[]]=[0,...r.steps.map((s,i)=>i<revealed?s.energy:null)];
    ctx.output.innerHTML=panel(t('电池库存随时间变化','Stored energy over time'),lineChart(t('储能电量轨迹','Battery energy trajectory'),[{label:t('存储电量','Stored energy'),values:states}],'MWh',t('完成时段数（0 为初始）','Completed periods (0 is initial)')))+`<div class="lab-state"><span>${t('已执行时段','Periods executed')} <strong data-iteration>${revealed} / 6</strong></span><span>${t('初始电量','Initial energy')}: 0 MWh</span></div><div class="lab-steps">${r.steps.map((_,i)=>`<span class="${i<revealed?'active':''}"></span>`).join('')}</div><div class="lab-metrics">${metric(t('当前电量 / 容量','Stored energy / capacity'),`${fmt(energy)} / ${cfg.capacity} MWh`)}${metric(t('累计净现金流','Cumulative net cash flow'),`${fmt(cash,2)} CNY`)}${metric(t('累计效率损耗','Cumulative efficiency loss'),`${fmt(loss,3)} MWh`)}${metric(t('双向效率乘积','Round-trip efficiency'),`${fmt(cfg.chargeEfficiency*cfg.dischargeEfficiency*100,1)}%`)}</div>`+table([t('时段','Period'),'CNY/MWh',t('实际功率 MW','Actual power MW'),t('期末 MWh','End MWh'),t('现金流 CNY','Cash flow CNY')],r.steps.map((s,i)=>[i+1,s.price,i<revealed?fmt(s.power):'—',i<revealed?fmt(s.energy):'—',i<revealed?fmt(s.cashflow,2):'—']),t('正功率为购电充电，现金流为负；负功率为放电售电。实际功率受额定功率和可用库存裁切。','Positive power buys energy to charge, producing negative cash flow; negative power sells discharged energy. Actual power is clipped by rating and inventory.'))+equation(`Eₜ₊₁ = Eₜ + ηc·Pcharge·Δt − Pdischarge·Δt/ηd\nηc = ηd = ${cfg.chargeEfficiency}; Δt = ${cfg.hours} h`)+(completed&&!balanced?`<div class="lab-warning" role="status">${t(`期末还有 ${fmt(energy)} MWh 库存，初始为 0。这里显示的是已发生现金流，不能直接与期末归零的完整循环比较收益。`,`Terminal inventory is ${fmt(energy)} MWh versus zero initially. The amount shown is realized cash flow and is not directly comparable with a cycle ending empty.`)}</div>`:completed?note(t('能量守恒核验','Energy balance check'),t(`购入 ${fmt(r.bought)} − 售出 ${fmt(r.sold)} = 损耗 ${fmt(r.losses)} MWh。期末回到 0；费用尚未计全，现金流仍不是实际项目利润。`,`Purchased ${fmt(r.bought)} − sold ${fmt(r.sold)} = losses ${fmt(r.losses)} MWh. Terminal energy returns to zero; omitted costs mean cash flow is still not real project profit.`)):note(t('先检查可执行性','Check feasibility first'),t('观察哪些时段因电池满或空而自动裁切功率。没有足够库存时，报价本身不能创造可放出的电量。','Watch which periods clip power because the battery is full or empty. A bid cannot create dischargeable energy when inventory is insufficient.')));
  };
  const step=()=>{if(revealed>=6)return false;revealed++;draw();return revealed<6;};const playback=player(ctx,step,900);
  ctx.onInput(()=>{playback.stop();revealed=0;draw();});ctx.onAction(a=>{if(a==='play')playback.toggle();else if(a==='step'){playback.stop();step();}else if(a==='reset'||a==='preset'){playback.stop();setValues(ctx,{capacity:4,power:2,hours:1,efficiency:.9,discharge:a==='preset'?.2:1,peak:900});revealed=0;draw();}});
  draw();return ctx.cleanup;
}
