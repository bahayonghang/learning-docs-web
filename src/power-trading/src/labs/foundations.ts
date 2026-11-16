import type { Locale } from '../types';
import { energyCost, scenarioStats, neuron, gradientStep, trainX, trainY, mse } from './math';
import { createLab, range, simpleActions, actions, staticLab, panel, equation, note, metric, bars, svg, esc, fmt, player, setValues, lineChart } from './shared';

export function energyLab(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const ctx = createLab(host, locale, {
    intro:t('把一个工厂看成恒定功率的负荷。矩形的高度是功率，宽度是时长，面积就是电量。','Treat a factory as a constant-power load. Rectangle height is power, width is duration, and area is energy.'),
    challenge:t('功率减半、时间加倍，电量与电费会改变吗？如果电价为负呢？','If power halves and time doubles, do energy and cost change? What if the price is negative?'),
    controls:range('power',t('工厂功率','Factory power'),0,20,0.5,8,' MW') + range('hours',t('运行时长','Operating duration'),0,8,0.25,2,' h') + range('price',t('电能价格','Energy price'),-200,1200,10,400,' CNY/MWh') + simpleActions(t),
    boundary:t('恒定功率、单一电价的教学例子。费用只包括电能部分，不含输配电价、容量/需量费用、税费、偏差处理或合同条款。电价是自定参数，不是当前市场行情。','Constant power at one teaching price. Cost includes only energy, excluding network charges, capacity/demand charges, taxes, imbalance rules, and contract terms. Prices are chosen inputs, not market quotations.'),
  });
  const draw = () => {
    const p = ctx.number('power'), hours = ctx.number('hours'), price = ctx.number('price'), result = energyCost(p,hours,price);
    const width = hours / 8 * 410, height = p / 20 * 170;
    ctx.output.innerHTML = panel(t('面积就是电量','The area is energy'),svg(t('功率乘以时长的矩形','Power multiplied by duration'), `<path d="M60 35V225H485" class="lab-grid"/><rect x="60" y="${225-height}" width="${width}" height="${height}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="60" y="22" class="lab-svg-small">MW</text><text x="478" y="250" class="lab-svg-small">h</text><text x="52" y="230" text-anchor="end" class="lab-svg-small">0</text><text x="478" y="241" text-anchor="end" class="lab-svg-small">8</text><text x="52" y="55" text-anchor="end" class="lab-svg-small">20</text><text x="275" y="115" text-anchor="middle">${fmt(p)} MW × ${fmt(hours)} h</text><text x="275" y="150" text-anchor="middle" class="fill-accent">${fmt(result.energy)} MWh</text>`)) + `<div class="lab-metrics">${metric(t('用电量','Energy consumed'),`${fmt(result.energy)} MWh`,`${fmt(result.energy*1000)} kWh`)}${metric(t('电能费用','Energy charge'),`${fmt(result.cost)} CNY`)}</div>` + equation(`${fmt(p)} MW × ${fmt(hours)} h = ${fmt(result.energy)} MWh; ${fmt(result.energy)} × ${fmt(price)} = ${fmt(result.cost)} CNY`) + note(t('检查单位','Check the units'),t('1 MWh = 1,000 kWh。元/MWh 除以 1,000 才是元/kWh，别把 MW 和 MWh 混用。','1 MWh = 1,000 kWh. Divide CNY/MWh by 1,000 to obtain CNY/kWh; MW and MWh are different quantities.'));
  };
  return staticLab(ctx,draw,{power:4,hours:4,price:400});
}

export function expectationLab(host: HTMLElement, locale: Locale) {
  const t = (zh:string,en:string) => locale==='zh'?zh:en;
  const ctx=createLab(host,locale,{
    intro:t('低价、常态、尖峰是三种互斥且穷尽的教学场景。权重会自动除以总权重，变成和为 1 的概率。','Low, normal, and spike prices form three exclusive, exhaustive teaching scenarios. Weights are divided by their sum to obtain probabilities.'),
    challenge:t('尖峰概率很小，是否就可以忽略？先猜它会怎样拉动均值与标准差。','Can a rare price spike be ignored? Predict its effect on the mean and standard deviation.'),
    controls:range('low',t('低价场景权重','Low-price weight'),0,100,5,25)+range('normal',t('常态场景权重','Normal-price weight'),0,100,5,60)+range('spike',t('尖峰场景权重','Spike weight'),0,100,5,15)+range('spikePrice',t('尖峰电价','Spike price'),400,2000,50,1000,' CNY/MWh')+simpleActions(t),
    boundary:t('三个离散、人工设定的价格场景，不是统计估计或概率预测。标准差衡量双向波动，不能单独代表亏损风险；场景遗漏会让估计失真。','Three hand-set discrete scenarios, not estimated probabilities or forecasts. Standard deviation measures two-sided variation, not downside loss alone; omitted scenarios distort the estimate.'),
  });
  const draw=()=>{
    const weights=[ctx.number('low'),ctx.number('normal'),ctx.number('spike')],values=[200,400,ctx.number('spikePrice')];
    if(weights.every(w=>w===0)){ctx.output.innerHTML=`<div class="lab-warning" role="alert">${t('至少给一个场景正权重；总权重为 0 时概率没有定义。','Assign a positive weight to at least one scenario. Probabilities are undefined when every weight is zero.')}</div>`;return;}
    const r=scenarioStats(values,weights),labels=[t('低价','Low'),t('常态','Normal'),t('尖峰','Spike')];
    ctx.output.innerHTML=panel(t('归一化后的概率','Normalized probabilities'),bars(labels,r.probabilities,{percent:true,max:1}))+panel(t('各场景对期望价格的贡献','Each scenario’s contribution to the expected price'),bars(labels,values.map((v,i)=>v*r.probabilities[i])),t('条形的数值是概率 × 价格，单位为元/MWh。','Each bar is probability × price, in CNY/MWh.'))+`<div class="lab-metrics">${metric(t('期望电价','Expected price'),`${fmt(r.mean,2)} CNY/MWh`)}${metric(t('电价标准差','Price standard deviation'),`${fmt(r.sd,2)} CNY/MWh`)}</div>`+equation(values.map((v,i)=>`${fmt(r.probabilities[i],3)} × ${v}`).join(' + ')+` ≈ ${fmt(r.mean,2)} CNY/MWh`)+note(t('期望不是承诺','An expectation is not a promise'),t('期望是重复场景的加权平均，不代表下一次一定会出现这个价格。先把场景列全，再讨论概率是否可信。','An expectation is a probability-weighted mean, not the guaranteed next price. Specify the scenarios before assessing whether their probabilities are credible.'));
  };
  return staticLab(ctx,draw,{low:25,normal:70,spike:5,spikePrice:2000});
}

export function neuronLab(host:HTMLElement,locale:Locale){
  const t=(zh:string,en:string)=>locale==='zh'?zh:en;
  const ctx=createLab(host,locale,{
    intro:t('温度与上一时刻负荷先变成无量纲特征，再进行加权求和、ReLU 和固定的输出缩放。每条连线都对应当前权重。','Temperature and lagged load are standardized before a weighted sum, ReLU, and fixed output scaling. Each connection corresponds to the current weight.'),
    challenge:t('把偏置调得很低，使加权和小于 0。继续降低温度时，为什么输出不再下降？','Lower the bias until the weighted sum is negative. Why does lowering temperature further no longer reduce the output?'),
    controls:range('temperature',t('温度','Temperature'),0,40,1,30,' °C')+range('load',t('历史负荷','Lagged load'),10,100,1,60,' MW')+range('w1',t('温度权重 w₁','Temperature weight w₁'),-2,2,0.1,0.6)+range('w2',t('负荷权重 w₂','Load weight w₂'),-2,2,0.1,0.8)+range('bias',t('偏置 b','Bias b'),-3,3,0.1,0.2)+simpleActions(t),
    boundary:t('单隐藏神经元、人工权重的前向演示，没有训练，也不是真实负荷预测器。均值/尺度是教学常数；真实项目必须只用训练数据估计标准化参数。','Forward pass through one hidden neuron with manual weights. It is untrained and not a real load forecaster. Scaling constants are illustrative; real preprocessing must be fitted only on training data.'),
  });
  const draw=()=>{
    const w1=ctx.number('w1'),w2=ctx.number('w2'),b=ctx.number('bias'),r=neuron(ctx.number('temperature'),ctx.number('load'),w1,w2,b);
    const line=(y:number,w:number)=>`<line x1="116" y1="${y}" x2="255" y2="135" stroke="${w>=0?'var(--accent)':'var(--lab-teal)'}" stroke-width="${1+Math.abs(w)*2}" ${w<0?'stroke-dasharray="6 5"':''}/>`;
    ctx.output.innerHTML=panel(t('一次前向计算','One forward pass'),svg(t('带权连接的神经元','A neuron with weighted connections'),`${line(70,w1)}${line(200,w2)}<line x1="285" y1="135" x2="414" y2="135" stroke="var(--accent)" stroke-width="2"/><circle cx="80" cy="70" r="35" class="lab-node"/><circle cx="80" cy="200" r="35" class="lab-node"/><circle cx="270" cy="135" r="43" class="lab-node emphasis"/><circle cx="450" cy="135" r="42" class="lab-node"/><text x="80" y="75" text-anchor="middle">${fmt(r.x[0])}</text><text x="80" y="205" text-anchor="middle">${fmt(r.x[1])}</text><text x="80" y="20" text-anchor="middle" class="lab-svg-small">x₁</text><text x="80" y="255" text-anchor="middle" class="lab-svg-small">x₂</text><text x="180" y="70" text-anchor="middle" class="lab-svg-small">w₁ = ${fmt(w1)}</text><text x="180" y="213" text-anchor="middle" class="lab-svg-small">w₂ = ${fmt(w2)}</text><text x="270" y="129" text-anchor="middle">ReLU</text><text x="270" y="152" text-anchor="middle" class="lab-svg-small">${fmt(r.activation)}</text><text x="270" y="214" text-anchor="middle" class="lab-svg-small">b = ${fmt(b)}</text><text x="450" y="133" text-anchor="middle">${fmt(r.prediction,1)}</text><text x="450" y="154" text-anchor="middle" class="lab-svg-small">MW</text><text x="356" y="108" text-anchor="middle" class="lab-svg-small">× 20 + 50</text>`,520,280),t('实线为非负权重，虚线为负权重；线宽随权重绝对值变化。','Solid connections have nonnegative weights; dashed connections have negative weights. Width follows absolute weight.'))+`<div class="lab-metrics">${metric(t('加权和 z','Weighted sum z'),fmt(r.z))}${metric(t('预测负荷','Predicted load'),`${fmt(r.prediction)} MW`)}</div>`+equation(`x₁ = (T − 20)/10 = ${fmt(r.x[0])}; x₂ = (L − 50)/20 = ${fmt(r.x[1])}\nz = ${fmt(w1)} × ${fmt(r.x[0])} + ${fmt(w2)} × ${fmt(r.x[1])} + ${fmt(b)} = ${fmt(r.z)}\nŷ = 50 + 20 × max(0, z) = ${fmt(r.prediction)} MW`)+note(t('预测与学习是两件事','Prediction and learning are separate'),t('这里手动改变权重。下一实验让损失函数的梯度告诉我们参数应该怎样更新。','Here you change the weights manually. The next experiment uses loss gradients to update parameters.'));
  };
  return staticLab(ctx,draw,{temperature:20,load:50,w1:0.6,w2:0.8,bias:-1});
}

export function gradientLab(host:HTMLElement,locale:Locale){
  const t=(zh:string,en:string)=>locale==='zh'?zh:en;
  const ctx=createLab(host,locale,{
    intro:t('用六个合成样本拟合 y = wx + b。每一步都根据全部样本的均方误差计算真实梯度，更新直线和损失曲线。','Fit y = wx + b to six synthetic observations. Every step computes the full-data MSE gradient and updates the line and loss curve.'),
    challenge:t('先预测：学习率大一点一定收敛更快吗？试试 0.1，再试 1.2。','Predict first: does a larger learning rate always converge faster? Try 0.1, then 1.2.'),
    controls:range('rate',t('学习率 η','Learning rate η'),0.01,1.2,0.01,0.1)+actions(t)+`<div class="lab-actions"><button data-action="preset" type="button">${t('试试过大学习率','Try an excessive step size')}</button></div><p class="lab-control-help">${t('x=(温度−20)/10；y=(负荷−50)/20。最多 80 步。减少动态效果设置下，播放按钮只推进一步。','x=(temperature−20)/10; y=(load−50)/20. Up to 80 steps. With reduced motion, Play advances only one step.')}</p>`,
    boundary:t('一元线性模型、全批次梯度下降、固定合成数据。这里理解训练机制，不宣称线性模型能拟合所有电力负荷。MSE 单位是标准化负荷的平方。','One linear feature, full-batch gradient descent, and fixed synthetic data. This demonstrates training mechanics, not universal load-prediction ability. MSE uses squared standardized-load units.'),
  });
  let w=-0.3,b=0,iteration=0,lastDw=0,lastDb=0;let history=[mse(trainX,trainY,w,b)];let halted=false;
  const draw=()=>{
    const xs=(x:number)=>70+(x+1)/2.5*400,ys=(y:number)=>230-y/1.6*185;
    const points=trainX.map((x,i)=>`<circle cx="${xs(x)}" cy="${ys(trainY[i])}" r="5" class="lab-trail"/>`).join('');
    const lineY=(x:number)=>w*x+b;
    ctx.output.innerHTML=panel(t('拟合直线与训练样本','Fitted line and training samples'),svg(t('线性回归拟合','Linear regression fit'),`<path d="M60 30V238H490" class="lab-grid"/>${points}<defs><clipPath id="gradient-plot-clip"><rect x="60" y="30" width="430" height="208"/></clipPath></defs><path d="M${xs(-1)},${ys(lineY(-1))} L${xs(1.5)},${ys(lineY(1.5))}" class="lab-curve" clip-path="url(#gradient-plot-clip)"/><text x="58" y="18" class="lab-svg-small">y</text><text x="484" y="258" class="lab-svg-small">x</text><text x="75" y="258" class="lab-svg-small">−1</text><text x="465" y="258" class="lab-svg-small">1.5</text>`),t('青色点为训练样本，橙色为当前模型；超出绘图区的线端点会裁切。','Teal points are training observations; orange is the current model. Line endpoints outside the plot are clipped.'))+`<div class="lab-state"><span>${t('迭代','Iteration')} <strong data-iteration>${iteration} / 80</strong></span><span>ŷ = ${fmt(w)}x + ${fmt(b)}</span></div>`+`<div class="lab-metrics">${metric('MSE',fmt(history.at(-1)!,6))}${metric(t('最后梯度 ∂L/∂w','Last gradient ∂L/∂w'),fmt(lastDw,5))}</div>`+panel(t('损失怎样变化','How the loss changes'),lineChart('MSE',[{label:'MSE',values:history}],t('标准化平方误差','Squared normalized error'),t('训练步数','Training step')))+equation(`w ← w − ${fmt(ctx.number('rate'))} × ∂L/∂w\nb ← b − ${fmt(ctx.number('rate'))} × ∂L/∂b;  ∂L/∂b = ${fmt(lastDb,5)}`)+(halted?`<div class="lab-warning" role="status">${t('损失快速发散，已停止。降低学习率并重置，观察变化。','Loss diverged rapidly; training stopped. Lower the learning rate and reset.')}</div>`:'');
  };
  const step=()=>{
    if(iteration>=80||halted)return false;
    const r=gradientStep(w,b,ctx.number('rate'));w=r.w;b=r.b;lastDw=r.dw;lastDb=r.db;iteration++;history.push(r.loss);halted=!Number.isFinite(r.loss)||r.loss>1e5;draw();return iteration<80&&!halted;
  };
  const playback=player(ctx,step,450);
  ctx.onInput(()=>{playback.stop();draw();});
  ctx.onAction(action=>{if(action==='play')playback.toggle();else if(action==='step'){playback.stop();step();}else if(action==='reset'||action==='preset'){playback.stop();setValues(ctx,{rate:action==='preset'?1.2:.1});w=-0.3;b=0;iteration=0;lastDw=lastDb=0;halted=false;history=[mse(trainX,trainY,w,b)];draw();}});
  draw();return ctx.cleanup;
}
